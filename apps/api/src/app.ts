import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import argon2 from 'argon2';
import mongoose from 'mongoose';
import { z, ZodError } from 'zod';
import { randomUUID } from 'node:crypto';
import { assetRegistry, configurationSchema, buildInput, productSchema, compatibility, validateConfiguration, variantById, slotSchema, slots, brandDisclaimer, technicalDisclaimer, type Configuration, type Product } from '@tracklab/domain';
import type { Config } from './config';
import { Audit, Build, ProductModel, RecoveryToken, Session, Subject, User } from './models';
import { ApiError, hash, privateKey, randomToken, sign, unsign, type RateStore } from './security';
import { charge, DAY, withSubject } from './quotas';
import { defaultConfiguration } from './catalog';
import type { SendMail } from './mail';

type Identity = { subject: string; guestId: string; csrf: string; sessionId: string; user: { id: string; email: string; name: string; role: string; verified: boolean; theme: string } | null };
declare module 'express-serve-static-core' { interface Request { identity: Identity; traceId: string } }
const HOUR = 3600000;
const idSchema = z.string().regex(/^[a-f\d]{24}$/i);
const credentials = z.object({ email: z.email().max(254).transform(v => v.toLowerCase()), password: z.string().min(12).max(128) });
const publicUser = (u: { _id: unknown; email: string; name: string; role: string; verified: boolean; theme: string }) => ({ id: String(u._id), email: u.email, name: u.name, role: u.role, verified: u.verified, theme: u.theme });
const guard = (req: Request) => { if (!req.identity.user) throw new ApiError(401, 'AUTH_REQUIRED', 'Create an account or sign in to save and manage builds.'); return req.identity.user; };
const requireAdmin = (req: Request) => { const u = guard(req); if (u.role !== 'admin') throw new ApiError(403, 'FORBIDDEN', 'Administrator access is required.'); return u; };
async function catalog(includeArchived = false): Promise<Product[]> { return (await ProductModel.find(includeArchived ? {} : { 'data.status': 'published' }).lean()).map(p => p.data as Product); }
async function catalogSnapshot(configuration: Configuration) { const selected = new Set(Object.values(configuration)); return (await catalog(true)).filter(p => p.variants.some(v => selected.has(v.id))).map(p => ({ ...p, variants: p.variants.filter(v => selected.has(v.id)) })); }
function initialConfiguration(products: Product[]): Configuration { return Object.fromEntries(slots.map(slot => { const original = variantById(products, defaultConfiguration[slot]); const id = original?.product.status === 'published' ? original.variant.id : (products.find(p => p.slot === slot && p.status === 'published' && p.illustrative) || products.find(p => p.slot === slot && p.status === 'published'))?.variants[0].id; if (!id) throw new ApiError(503, 'CATALOG_INCOMPLETE', `No published ${slot} is available. Please try again later.`); return [slot, id]; })) as Configuration; }
async function validated(config: Configuration, includeArchived = false) { const products = await catalog(includeArchived); try { validateConfiguration(config, products, includeArchived); } catch (e) { throw new ApiError(422, 'VARIANT_UNAVAILABLE', (e as Error).message); } const result = compatibility(config, products); if (result.state === 'incompatible') throw new ApiError(422, 'INCOMPATIBLE_SELECTION', 'This selection conflicts with your current parts. Review the affected interfaces.', result); return result; }

export function createApp(config: Config, rate: RateStore, sendMail: SendMail) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY_HOPS);
  app.use(helmet());
  app.use(cors({ origin: config.FRONTEND_URL, credentials: true, allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Editor-Token'], exposedHeaders: ['Retry-After', 'X-Request-Id'] }));
  app.use(express.json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use((req, res, next) => { req.traceId = randomUUID(); res.setHeader('X-Request-Id', req.traceId); res.setHeader('Cache-Control', 'no-store'); req.setTimeout(15000); next(); });
  const secure = config.NODE_ENV === 'production';
  const cookieName = secure ? '__Host-tracklab' : 'tracklab';
  const guestCookieName = secure ? '__Host-tracklab-guest' : 'tracklab-guest';
  const cookieOptions = { httpOnly: true, secure, sameSite: config.COOKIE_SAME_SITE, path: '/', maxAge: 30 * DAY } as const;
  async function newSession(res: Response, userId: string | undefined, guestId: string) {
    const token = randomToken(), csrf = randomToken();
    const session = await Session.create({ tokenHash: hash(token), csrf, userId, guestId, expiresAt: new Date(Date.now() + 30 * DAY) });
    res.cookie(cookieName, sign({ kind: 'session', token }, config.SESSION_SECRET), cookieOptions);
    return { session, csrf };
  }
  app.get('/api/health', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ success: mongoose.connection.readyState === 1, status: mongoose.connection.readyState === 1 ? 'ready' : 'unavailable' }));
  app.use('/api', async (req, res, next) => {
    try {
      const ipKey = privateKey(req.ip || 'unknown', config.SESSION_SECRET);
      // High secondary threshold, separate from per-guest / account policies.
      await rate.consume(`infrastructure:${ipKey}`, 600, 60000);
      let session = null;
      if (req.cookies[cookieName]) {
        try { const cookie = unsign<{ kind?: string; token?: string }>(req.cookies[cookieName], config.SESSION_SECRET); if (cookie && typeof cookie.token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(cookie.token) && (!cookie.kind || cookie.kind === 'session')) session = await Session.findOne({ tokenHash: hash(cookie.token), expiresAt: { $gt: new Date() } }); } catch (error) { if (!(error instanceof ApiError)) throw error; }
      }
      // Guest usage identity outlives authentication/session rotation. A legacy
      // server-side guest ID is retained when introducing the separate cookie.
      let guestId: string | undefined;
      if (req.cookies[guestCookieName]) {
        try {
          const guest = unsign<{ kind: string; id: string; expires: number }>(req.cookies[guestCookieName], config.SESSION_SECRET);
          if (guest && guest.kind === 'guest' && /^[A-Za-z0-9_-]{43}$/.test(guest.id) && guest.expires > Date.now()) guestId = guest.id;
        } catch (error) { if (!(error instanceof ApiError)) throw error; }
      }
      if (!guestId) {
        guestId = session?.guestId || randomToken();
        res.cookie(guestCookieName, sign({ kind: 'guest', id: guestId, expires: Date.now() + 30 * DAY }, config.SESSION_SECRET), cookieOptions);
      }
      if (!session) { await rate.consume(`sessions:${ipKey}`, 600, HOUR); session = (await newSession(res, undefined, guestId)).session; }
      const user = session.userId ? await User.findById(session.userId) : null;
      if (session.userId && !user) { await Session.deleteOne({ _id: session._id }); throw new ApiError(401, 'SESSION_EXPIRED', 'Please sign in again.'); }
      req.identity = { subject: user ? `user:${user._id}` : `guest:${guestId}`, guestId, csrf: session.csrf, sessionId: String(session._id), user: user ? publicUser(user) : null };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        if (req.get('Origin') !== config.FRONTEND_URL || req.get('X-CSRF-Token') !== session.csrf) throw new ApiError(403, 'CSRF_INVALID', 'Your security token expired. Refresh the page and try again.');
      }
      await rate.consume(`general:${req.identity.subject}`, config.GENERAL_RPM, 60000);
      next();
    } catch (error) { next(error); }
  });
  app.get('/api/session', async (req, res) => {
    const subject = await Subject.findById(req.identity.subject).lean();
    const changes = (subject?.changes ?? []).filter(t => t > Date.now() - DAY), previews = (subject?.previews ?? []).filter(t => t > Date.now() - DAY);
    res.json({ user: req.identity.user, csrf: req.identity.csrf, workspaceKey: privateKey(req.identity.subject, config.SESSION_SECRET), mode: config.DEVELOPMENT_EPHEMERAL ? 'ephemeral-development' : 'connected', limits: { builds: config.BUILD_LIMIT, publish: config.PUBLISH_LIMIT, changes: config.GUEST_CHANGES, previews: config.GUEST_PREVIEWS }, usage: { changes: changes.length, previews: previews.length, changesResetAt: changes.length ? new Date(changes[0] + DAY).toISOString() : null, previewsResetAt: previews.length ? new Date(previews[0] + DAY).toISOString() : null } });
  });
  const authRate = async (req: Request, category: string, limit: number, window: number, email?: string) => {
    await rate.consume(`${category}:ip:${privateKey(req.ip || '', config.SESSION_SECRET)}`, category === 'login' ? 30 : limit, window);
    if (email) await rate.consume(`${category}:email:${privateKey(email, config.SESSION_SECRET)}`, limit, window);
  };
  async function recovery(userId: string, email: string, kind: 'verify' | 'reset') {
    const token = randomToken();
    await RecoveryToken.create({ userId, kind, hash: hash(token), expiresAt: new Date(Date.now() + (kind === 'verify' ? DAY : HOUR / 2)) });
    await sendMail(email, kind, token);
  }
  app.post('/api/auth/register', async (req, res) => {
    const input = credentials.extend({ name: z.string().trim().min(1).max(80) }).strict().parse(req.body);
    await authRate(req, 'register', 3, HOUR);
    if (await User.exists({ email: input.email })) throw new ApiError(409, 'REGISTRATION_UNAVAILABLE', 'Registration could not be completed. Try signing in or recovering your account.');
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await User.create({ email: input.email, name: input.name, passwordHash });
    await Session.deleteOne({ _id: req.identity.sessionId });
    const { csrf } = await newSession(res, String(user._id), req.identity.guestId);
    let emailSent = true;
    try { await recovery(String(user._id), user.email, 'verify'); } catch { emailSent = false; }
    res.status(201).json({ user: publicUser(user), csrf, emailSent });
  });
  app.post('/api/auth/login', async (req, res) => {
    const input = credentials.parse(req.body);
    await authRate(req, 'login', 5, 15 * 60000, input.email);
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    const valid = user ? await argon2.verify(user.passwordHash, input.password) : (await argon2.hash(input.password), false);
    if (!user || !valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'The email or password is incorrect.');
    await Session.deleteOne({ _id: req.identity.sessionId });
    const { csrf } = await newSession(res, String(user._id), req.identity.guestId);
    res.json({ user: publicUser(user), csrf });
  });
  app.post('/api/auth/logout', async (req, res) => { await Session.deleteOne({ _id: req.identity.sessionId }); const { csrf } = await newSession(res, undefined, req.identity.guestId); res.json({ user: null, csrf }); });
  app.post('/api/auth/forgot-password', async (req, res) => { const { email } = z.object({ email: z.email().transform(v => v.toLowerCase()) }).parse(req.body); await authRate(req, 'recovery', 3, HOUR, email); const user = await User.findOne({ email }); if (user) await recovery(String(user._id), email, 'reset'); res.json({ message: 'If an account exists, a recovery link will be sent.' }); });
  app.post('/api/auth/resend-verification', async (req, res) => { const user = guard(req); await authRate(req, 'verification', 3, HOUR, user.email); if (!user.verified) await recovery(user.id, user.email, 'verify'); res.json({ message: 'If verification is needed, a link will be sent.' }); });
  app.post('/api/auth/verify', async (req, res) => {
    const { token } = z.object({ token: z.string().min(20).max(200) }).parse(req.body);
    await authRate(req, 'verify-token', 10, HOUR);
    await mongoose.connection.transaction(async session => {
      const recoveryToken = await RecoveryToken.findOneAndDelete({ hash: hash(token), kind: 'verify', expiresAt: { $gt: new Date() } }, { session });
      if (!recoveryToken) throw new ApiError(400, 'TOKEN_EXPIRED', 'This link is invalid or has expired.');
      await User.updateOne({ _id: recoveryToken.userId }, { $set: { verified: true } }, { session });
      await RecoveryToken.deleteMany({ userId: recoveryToken.userId, kind: 'verify' }, { session });
    });
    res.json({ message: 'Email verified. You can now publish your builds.' });
  });
  app.post('/api/auth/reset-password', async (req, res) => {
    const input = z.object({ token: z.string().min(20).max(200), password: credentials.shape.password }).parse(req.body);
    await authRate(req, 'reset-token', 5, HOUR);
    const passwordHash = await argon2.hash(input.password);
    await mongoose.connection.transaction(async session => {
      const token = await RecoveryToken.findOneAndDelete({ hash: hash(input.token), kind: 'reset', expiresAt: { $gt: new Date() } }, { session });
      if (!token) throw new ApiError(400, 'TOKEN_EXPIRED', 'This link is invalid or has expired.');
      await User.updateOne({ _id: token.userId }, { $set: { passwordHash } }, { session });
      await RecoveryToken.deleteMany({ userId: token.userId, kind: 'reset' }, { session });
      await Session.deleteMany({ userId: token.userId }, { session });
    });
    res.clearCookie(cookieName, cookieOptions); res.json({ message: 'Password reset. Sign in with your new password.' });
  });
  app.patch('/api/account', async (req, res) => { const user = guard(req); const input = z.object({ name: z.string().trim().min(1).max(80), theme: z.enum(['light', 'dark', 'system']) }).strict().parse(req.body); const updated = await User.findByIdAndUpdate(user.id, { $set: input }, { returnDocument: 'after' }); res.json({ user: publicUser(updated!) }); });
  app.post('/api/account/password', async (req, res) => {
    const user = guard(req); const input = z.object({ currentPassword: z.string().max(128), password: credentials.shape.password }).parse(req.body);
    await authRate(req, 'change-password', 5, HOUR, user.email);
    const record = await User.findById(user.id).select('+passwordHash');
    if (!record || !await argon2.verify(record.passwordHash, input.currentPassword)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Your current password is incorrect.');
    const passwordHash = await argon2.hash(input.password);
    await mongoose.connection.transaction(async session => { await User.updateOne({ _id: user.id }, { $set: { passwordHash } }, { session }); await Session.deleteMany({ userId: user.id }, { session }); await RecoveryToken.deleteMany({ userId: user.id }, { session }); });
    const { csrf } = await newSession(res, user.id, req.identity.guestId); res.json({ csrf, message: 'Password changed. Other sessions have been revoked.' });
  });
  app.post('/api/account/revoke-sessions', async (req, res) => { const user = guard(req); await Session.deleteMany({ userId: user.id }); const { csrf } = await newSession(res, user.id, req.identity.guestId); res.json({ csrf, message: 'All other sessions revoked.' }); });
  app.delete('/api/account', async (req, res) => {
    const user = guard(req); const { password } = z.object({ password: z.string().max(128) }).parse(req.body);
    await authRate(req, 'delete-account', 5, HOUR, user.email);
    const record = await User.findById(user.id).select('+passwordHash');
    if (!record || !await argon2.verify(record.passwordHash, password)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Your password is incorrect.');
    await mongoose.connection.transaction(async session => { await Build.deleteMany({ owner: user.id }, { session }); await Session.deleteMany({ userId: user.id }, { session }); await RecoveryToken.deleteMany({ userId: user.id }, { session }); await Subject.deleteOne({ _id: `user:${user.id}` }, { session }); await User.deleteOne({ _id: user.id }, { session }); await Audit.deleteMany({ actor: user.id }, { session }); });
    res.clearCookie(cookieName, cookieOptions); res.json({ message: 'Your account and personal build data have been deleted.' });
  });
  app.get('/api/catalog', async (req, res) => {
    await rate.consume(`catalog:${req.identity.subject}`, req.identity.user ? config.CATALOG_USER_RPM : config.CATALOG_GUEST_RPM, 60000);
    const query = z.object({ slot: slotSchema.optional(), q: z.string().max(80).optional(), brand: z.string().max(80).optional(), page: z.coerce.number().int().min(1).max(100).default(1), limit: z.coerce.number().int().min(1).max(30).default(30) }).parse(req.query);
    const published = await catalog();
    const all = published.filter(p => (!query.slot || p.slot === query.slot) && (!query.brand || p.brand === query.brand) && (!query.q || `${p.name} ${p.brand}`.toLowerCase().includes(query.q.toLowerCase())));
    res.json({ items: all.slice((query.page - 1) * query.limit, query.page * query.limit), total: all.length, page: query.page, limit: query.limit, configuration: initialConfiguration(published) });
  });
  app.get('/api/catalog/:id', async (req, res) => { await rate.consume(`catalog:${req.identity.subject}`, req.identity.user ? config.CATALOG_USER_RPM : config.CATALOG_GUEST_RPM, 60000); const item = await ProductModel.findOne({ _id: String(req.params.id), 'data.status': 'published' }).lean(); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Product not found.'); res.json(item.data); });
  function workspaceToken(req: Request, configuration: Configuration) { return sign({ subject: req.identity.subject, configuration, expires: Date.now() + DAY }, config.SESSION_SECRET); }
  function readWorkspace(req: Request, token: string) { const payload = unsign<{ subject: string; configuration: Configuration; expires: number }>(token, config.SESSION_SECRET); if (payload.subject !== req.identity.subject || payload.expires < Date.now()) throw new ApiError(400, 'WORKSPACE_EXPIRED', 'Your workspace expired. Reopen the builder.'); return configurationSchema.parse(payload.configuration); }
  app.post('/api/workspace', async (req, res) => { await rate.consume(`bootstrap:${req.identity.subject}`, 30, 60000); const body = z.object({ configuration: configurationSchema.optional() }).parse(req.body); const configuration = req.identity.user && body.configuration ? body.configuration : initialConfiguration(await catalog()); await validated(configuration, !!req.identity.user); res.json({ configuration, token: workspaceToken(req, configuration) }); });
  app.post('/api/workspace/change', async (req, res) => {
    await rate.consume(`workspace:${req.identity.subject}`, 60, 60000);
    const input = z.object({ token: z.string().max(4096), slot: slotSchema, variantId: z.string().max(100) }).strict().parse(req.body);
    const current = readWorkspace(req, input.token);
    if (current[input.slot] === input.variantId) { res.json({ configuration: current, token: input.token, changed: false }); return; }
    const next = { ...current, [input.slot]: input.variantId };
    const result = await validated(next);
    if (!req.identity.user) await withSubject(req.identity.subject, async subject => { charge(subject as unknown as Record<string, unknown>, 'changes', config.GUEST_CHANGES, DAY, 'GUEST_CHANGE_LIMIT'); });
    res.json({ configuration: next, token: workspaceToken(req, next), compatibility: result, changed: true });
  });
  app.post('/api/workspace/preview', async (req, res) => {
    await rate.consume(`preview:${req.identity.subject}`, 10, 60000);
    const { token } = z.object({ token: z.string().max(4096) }).parse(req.body); const configuration = readWorkspace(req, token);
    const products = await catalog();
    if (!Object.values(configuration).every(id => { const product=variantById(products,id)?.product; return product?.illustrative || (product?.visual?.fidelity === 'measurement-schematic' && product.visual.assetId in assetRegistry && product.provenance?.reviewedAt); })) throw new ApiError(422, 'ASSET_UNAVAILABLE', 'A reviewed illustrative 3D representation is not registered for this assembly.');
    if (!req.identity.user) await withSubject(req.identity.subject, async subject => { charge(subject as unknown as Record<string, unknown>, 'previews', config.GUEST_PREVIEWS, DAY, 'GUEST_PREVIEW_LIMIT'); });
    res.json({ grant: sign({ subject: req.identity.subject, expires: Date.now() + HOUR }, config.SESSION_SECRET), expiresAt: new Date(Date.now() + HOUR).toISOString(), illustrative: true });
  });
  app.post('/api/compatibility', async (req, res) => { await rate.consume(`compatibility:${req.identity.subject}`, 30, 60000); const configuration = configurationSchema.parse(req.body); const products = await catalog(true); res.json(compatibility(configuration, products)); });
  app.get('/api/builds', async (req, res) => { const user = guard(req); const builds = await Build.find({ owner: user.id }).sort({ updatedAt: -1 }).select('-leaseHash').lean(); res.json({ items: builds, limit: config.BUILD_LIMIT }); });
  app.get('/api/builds/:id', async (req, res) => { const user = guard(req); const build = await Build.findOne({ _id: idSchema.parse(req.params.id), owner: user.id }).select('-leaseHash').lean(); if (!build) throw new ApiError(404, 'NOT_FOUND', 'Build not found.'); res.json(build); });
  async function createBuild(req: Request, input: z.infer<typeof buildInput>) {
    const user = guard(req); await validated(input.configuration, true);
    return withSubject(req.identity.subject, async (subject, session) => {
      if (await Build.countDocuments({ owner: user.id }).session(session) >= config.BUILD_LIMIT) throw new ApiError(409, 'BUILD_LIMIT_REACHED', `You have ${config.BUILD_LIMIT} saved builds. Delete a build to create another.`);
      const events = subject.creates.filter(t => t > Date.now() - DAY);
      if (events.length >= config.CREATE_DAILY_LIMIT) throw new ApiError(409, 'BUILD_DAILY_LIMIT', 'Daily build creation allowance reached.', { resetAt: new Date(events[0] + DAY).toISOString() });
      charge(subject as unknown as Record<string, unknown>, 'creates', config.CREATE_MONTHLY_LIMIT, 30 * DAY, 'BUILD_MONTHLY_LIMIT');
      charge(subject as unknown as Record<string, unknown>, 'saves', config.SAVE_HOURLY_LIMIT, HOUR, 'SAVE_LIMIT_REACHED');
      const [build] = await Build.create([{ ...input, owner: user.id, catalogSnapshot: await catalogSnapshot(input.configuration) }], { session });
      return build;
    });
  }
  app.post('/api/builds', async (req, res) => { guard(req); res.status(201).json(await createBuild(req, buildInput.strict().parse(req.body))); });
  app.post('/api/builds/:id/duplicate', async (req, res) => { const user = guard(req); const source = await Build.findOne({ _id: idSchema.parse(req.params.id), owner: user.id }); if (!source) throw new ApiError(404, 'NOT_FOUND', 'Build not found.'); res.status(201).json(await createBuild(req, { name: `${source.name.slice(0, 73)} (copy)`, configuration: source.configuration as Configuration })); });
  app.post('/api/builds/:id/lease', async (req, res) => {
    const user = guard(req), id = idSchema.parse(req.params.id), token = randomToken();
    const build = await Build.findOneAndUpdate({ _id: id, owner: user.id, $or: [{ leaseUntil: { $lt: new Date() } }, { leaseUntil: null }, ...(req.get('X-Editor-Token') ? [{ leaseHash: hash(req.get('X-Editor-Token')!) }] : [])] }, { $set: { leaseHash: hash(token), leaseUntil: new Date(Date.now() + 5 * 60000) } }, { returnDocument: 'after' });
    if (!build) throw new ApiError(409, 'EDITOR_LOCKED', 'This build is open in another editor. Wait up to five minutes or close that editor.');
    res.json({ editorToken: token, expiresAt: build.leaseUntil, revision: build.revision });
  });
  app.delete('/api/builds/:id/lease', async (req, res) => { const user = guard(req); await Build.updateOne({ _id: idSchema.parse(req.params.id), owner: user.id, leaseHash: hash(req.get('X-Editor-Token') || '') }, { $unset: { leaseHash: '', leaseUntil: '' } }); res.json({ success: true }); });
  app.patch('/api/builds/:id', async (req, res) => {
    const user = guard(req), id = idSchema.parse(req.params.id);
    const input = buildInput.extend({ revision: z.number().int().positive(), visibility: z.enum(['private', 'public']).default('private') }).strict().parse(req.body);
    await validated(input.configuration, true);
    if (input.visibility === 'public' && !user.verified) throw new ApiError(403, 'EMAIL_UNVERIFIED', 'Verify your email before publishing builds.');
    const result = await withSubject(req.identity.subject, async (subject, session) => {
      const current = await Build.findOne({ _id: id, owner: user.id }).session(session);
      if (!current) throw new ApiError(404, 'NOT_FOUND', 'Build not found.');
      if (current.revision !== input.revision) throw new ApiError(409, 'REVISION_CONFLICT', 'This build has changed. Reopen it to load the latest revision.');
      if (current.leaseHash !== hash(req.get('X-Editor-Token') || '') || !current.leaseUntil || current.leaseUntil.getTime() < Date.now()) throw new ApiError(409, 'EDITOR_LOCKED', 'Your editor lease expired. Reopen this build.');
      if (input.visibility === 'public' && current.visibility !== 'public' && await Build.countDocuments({ owner: user.id, visibility: 'public' }).session(session) >= config.PUBLISH_LIMIT) throw new ApiError(409, 'PUBLISH_LIMIT_REACHED', 'Unpublish another build before publishing this one.');
      charge(subject as unknown as Record<string, unknown>, 'saves', config.SAVE_HOURLY_LIMIT, HOUR, 'SAVE_LIMIT_REACHED');
      current.set({ name: input.name, configuration: input.configuration, catalogSnapshot: await catalogSnapshot(input.configuration), revision: input.revision + 1, visibility: input.visibility, publicId: input.visibility === 'public' ? current.publicId || randomToken() : undefined });
      await current.save({ session });
      return { ...current.toObject(), leaseHash: undefined };
    });
    res.json(result);
  });
  app.delete('/api/builds/:id', async (req, res) => { const user = guard(req); await withSubject(req.identity.subject, async (_subject, session) => { const result = await Build.deleteOne({ _id: idSchema.parse(req.params.id), owner: user.id }, { session }); if (!result.deletedCount) throw new ApiError(404, 'NOT_FOUND', 'Build not found.'); }); res.json({ success: true }); });
  app.post('/api/builds/:id/export', async (req, res) => { const user = guard(req); const build = await Build.findOne({ _id: idSchema.parse(req.params.id), owner: user.id }).select('name configuration revision').lean(); if (!build) throw new ApiError(404, 'NOT_FOUND', 'Build not found.'); await withSubject(req.identity.subject, async subject => { charge(subject as unknown as Record<string, unknown>, 'exports', config.EXPORT_DAILY_LIMIT, DAY, 'EXPORT_LIMIT_REACHED'); }); res.json({ schemaVersion: 1, build, exportedAt: new Date().toISOString(), brandDisclaimer, technicalDisclaimer }); });
  app.get('/api/public/builds/:id', async (req, res) => { const build = await Build.findOne({ publicId: z.string().max(100).parse(req.params.id), visibility: 'public' }).select('name configuration catalogSnapshot updatedAt revision').lean(); if (!build) throw new ApiError(404, 'NOT_FOUND', 'Public build not found.'); res.json(build); });
  app.post('/api/public/builds/:id/duplicate', async (req, res) => { guard(req); const build = await Build.findOne({ publicId: z.string().max(100).parse(req.params.id), visibility: 'public' }); if (!build) throw new ApiError(404, 'NOT_FOUND', 'Public build not found.'); res.status(201).json(await createBuild(req, { name: `${build.name.slice(0, 73)} (copy)`, configuration: build.configuration as Configuration })); });
  app.get('/api/admin/catalog', async (req, res) => { requireAdmin(req); const page = z.coerce.number().int().min(1).max(100).default(1).parse(req.query.page); res.json({ items: await ProductModel.find().skip((page - 1) * 30).limit(30).lean() }); });
  app.put('/api/admin/catalog/:id', async (req, res) => {
    const user = requireAdmin(req); await rate.consume(`admin:${user.id}`, 15, 60000);
    const input = productSchema.parse(req.body);
    if (input.id !== req.params.id) throw new ApiError(422, 'ID_MISMATCH', 'Product ID must match the URL.');
    if (!input.illustrative && input.status === 'published') throw new ApiError(422, 'PUBLICATION_REVIEW_REQUIRED', 'Manufacturer publishing is gated until per-field provenance, variant geometry and asset permissions have been reviewed. Keep this record as a draft.');
    const others = await ProductModel.find({ _id: { $ne: input.id } }).lean();
    const previous = (await ProductModel.findById(input.id).lean())?.data as Product | undefined;
    if (previous) for (const variant of previous.variants) {
      if (await Build.exists({ [`configuration.${previous.slot}`]: variant.id })) {
        const replacement = input.variants.find(v => v.id === variant.id);
        if (!replacement || input.slot !== previous.slot || JSON.stringify(replacement) !== JSON.stringify(variant)) throw new ApiError(409, 'REFERENCED_VARIANT_IMMUTABLE', 'This variant is used by saved builds. Preserve it and add a new variant for revisions.');
      }
    }
    if (others.some(p => (p.data as Product).variants.some(v => input.variants.some(i => i.id === v.id)))) throw new ApiError(409, 'DUPLICATE_VARIANT', 'Variant identifiers must be globally unique.');
    await mongoose.connection.transaction(async session => { await ProductModel.updateOne({ _id: input.id }, { $set: { data: input } }, { upsert: true, session }); await Audit.create([{ actor: user.id, action: 'catalog.update', target: input.id }], { session }); });
    res.json(input);
  });
  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpoint not found.')));
  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    let e = error instanceof ApiError ? error : error instanceof ZodError ? new ApiError(422, 'VALIDATION_ERROR', 'Check the submitted fields.', error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))) : new ApiError(500, 'INTERNAL_ERROR', 'The request could not be completed. Please try again.');
    if ((error as { code?: number })?.code === 11000) e = new ApiError(409, 'CONFLICT', 'A record with these details already exists.');
    if ((error as { type?: string })?.type === 'entity.too.large') e = new ApiError(413, 'BODY_TOO_LARGE', 'Request body exceeds the allowed size.');
    if (error instanceof SyntaxError && 'body' in error) e = new ApiError(400, 'INVALID_JSON', 'The request body must be valid JSON.');
    if (e.retryAfterSeconds) res.setHeader('Retry-After', String(e.retryAfterSeconds));
    if (e.status >= 500 && config.NODE_ENV !== 'test') console.error(JSON.stringify({ requestId: req.traceId, code: e.code, error: error instanceof Error ? error.message : 'Unknown error' }));
    res.status(e.status).json({ success: false, error: { code: e.code, message: e.message, details: e.details, retryAfterSeconds: e.retryAfterSeconds, requestId: req.traceId } });
  });
  return app;
}
