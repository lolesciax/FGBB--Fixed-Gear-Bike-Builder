import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request, { type Agent } from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { createApp } from '../apps/api/src/app';
import { parseConfig } from '../apps/api/src/config';
import { DevelopmentRateStore, sign } from '../apps/api/src/security';
import { Build, ProductModel, Subject, User, initializeModels, Session } from '../apps/api/src/models';
import { seedCatalog, defaultConfiguration } from '../apps/api/src/catalog';
const origin = 'http://localhost:5173';
const config = parseConfig({ NODE_ENV: 'test', FRONTEND_URL: origin });
let repl: MongoMemoryReplSet, app: ReturnType<typeof createApp>;
let letters: { email: string; kind: string; token: string }[];
type Client = { agent: Agent; csrf: string; userId?: string; guestCookie: string };
async function guest(): Promise<Client> { const server = createServer(app); server.setMaxListeners(30); /* The quota race deliberately makes 15 simultaneous Supertest calls. */ const agent = request.agent(server); const s = await agent.get('/api/session').expect(200); const guestCookie = (s.headers['set-cookie'] as unknown as string[]).find(value => value.startsWith('tracklab-guest='))?.split(';')[0]; if (!guestCookie) throw new Error('Guest usage cookie was not issued.'); return { agent, csrf: s.body.csrf, guestCookie }; }
function post(c: Client, path: string, body: object = {}) { return c.agent.post(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf).send(body); }
function patch(c: Client, path: string, body: object = {}, editorToken = '') { return c.agent.patch(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf).set('X-Editor-Token', editorToken).send(body); }
function del(c: Client, path: string) { return c.agent.delete(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf); }
async function member(email = 'rider@example.com') { const c = await guest(); const r = await post(c, '/auth/register', { name: 'Rider', email, password: 'a-long-test-passphrase' }).expect(201); c.csrf = r.body.csrf; c.userId = r.body.user.id; return c; }
async function workspace(c: Client) { return (await post(c, '/workspace').expect(200)).body; }
const build = { name: 'Daily rider', configuration: defaultConfiguration };
beforeAll(async () => { repl = await MongoMemoryReplSet.create({ binary: { downloadDir: resolve('.local/mongodb') }, replSet: { count: 1, storageEngine: 'wiredTiger' } }); await mongoose.connect(repl.getUri('tracklab-test')); await initializeModels(); });
beforeEach(async () => { for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({}); for (const p of seedCatalog) await ProductModel.create({ _id: p.id, data: p }); letters = []; app = createApp(config, new DevelopmentRateStore(), async (email, kind, token) => { letters.push({ email, kind, token }); }); });
afterAll(async () => { await mongoose.disconnect(); await repl?.stop(); });
describe('authentication and authorization', () => {
  it('uses HttpOnly same-site cookies and requires CSRF plus an allowed Origin', async () => { const c = await guest(); const s = await request(app).get('/api/session'); expect(s.headers['set-cookie'][0]).toMatch(/HttpOnly/); expect(s.headers['set-cookie'][0]).toMatch(/SameSite=Lax/); await c.agent.post('/api/workspace').set('Origin', origin).send({}).expect(403); await c.agent.post('/api/workspace').set('Origin', 'https://attacker.example').set('X-CSRF-Token', c.csrf).send({}).expect(403); });
  it('rotates sessions, hides hashes and prevents role assignment', async () => { const c = await guest(); const prior = c.csrf; await post(c, '/auth/register', { name: 'Rider', email: 'rider@example.com', password: 'a-long-test-passphrase', role: 'admin' }).expect(422); const r = await post(c, '/auth/register', { name: 'Rider', email: 'rider@example.com', password: 'a-long-test-passphrase' }).expect(201); expect(r.body.user.role).toBe('user'); expect(r.body.user.passwordHash).toBeUndefined(); expect(r.body.csrf).not.toBe(prior); expect(await Session.countDocuments()).toBe(1); });
  it('protects account data and administrator writes', async () => { const c = await member(); await c.agent.get('/api/admin/catalog').expect(403); const g = await guest(); await post(g, '/builds', build).expect(401); await g.agent.get('/api/builds').expect(401); });
  it('accepts email verification once and only once', async () => { const c = await member(); const letter = letters.find(l => l.kind === 'verify')!; await post(c, '/auth/verify', { token: letter.token }).expect(200); await post(c, '/auth/verify', { token: letter.token }).expect(400); expect((await User.findById(c.userId))?.verified).toBe(true); });
  it('resets a password once and revokes every existing authenticated session', async () => { const c = await member(); const resetClient = await guest(); await post(resetClient, '/auth/forgot-password', { email: 'rider@example.com' }).expect(200); const letter = letters.find(l => l.kind === 'reset')!; await post(resetClient, '/auth/reset-password', { token: letter.token, password: 'my-new-strong-passphrase' }).expect(200); expect(await Session.countDocuments({ userId: c.userId })).toBe(0); const g = await guest(); await post(g, '/auth/reset-password', { token: letter.token, password: 'another-long-passphrase' }).expect(400); const r = await post(g, '/auth/login', { email: 'rider@example.com', password: 'my-new-strong-passphrase' }).expect(200); expect(r.body.user.id).toBe(c.userId); });
  it('deletes associated personal data', async () => { const c = await member(); await post(c, '/builds', build).expect(201); await c.agent.delete('/api/account').set('Origin', origin).set('X-CSRF-Token', c.csrf).send({ password: 'a-long-test-passphrase' }).expect(200); expect(await User.countDocuments()).toBe(0); expect(await Build.countDocuments()).toBe(0); expect(await Session.countDocuments({ userId: c.userId })).toBe(0); });
});
describe('guest restrictions', () => {
  it('keeps guest usage through logout and authentication-cookie resets', async () => {
    const c = await guest(), w = await workspace(c);
    await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }).expect(200);
    await post(c, '/workspace/preview', { token: w.token }).expect(200);
    const logout = await post(c, '/auth/logout').expect(200); c.csrf = logout.body.csrf;
    const usage = (await c.agent.get('/api/session').expect(200)).body.usage;
    expect(usage.changes).toBe(1); expect(usage.previews).toBe(1);
    const reset = request.agent(app); const restored = await reset.get('/api/session').set('Cookie', c.guestCookie).expect(200);
    expect(restored.body.usage.changes).toBe(1); expect(restored.body.usage.previews).toBe(1);
  });
  it('restores original guest allowances after a registered session logs out', async () => {
    const c = await guest(), w = await workspace(c);
    await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }).expect(200);
    const registration = await post(c, '/auth/register', { name: 'Rider', email: 'rider@example.com', password: 'a-long-test-passphrase' }).expect(201); c.csrf = registration.body.csrf;
    const logout = await post(c, '/auth/logout').expect(200); c.csrf = logout.body.csrf;
    const restored = await c.agent.get('/api/session').expect(200);
    expect(restored.body.user).toBeNull(); expect(restored.body.usage.changes).toBe(1);
  });
  it('does not charge repeated selections, browsing or invalid compatibility', async () => { const c = await guest(); const w = await workspace(c); await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-classic' }).expect(200); await c.agent.get('/api/catalog?slot=tires').expect(200); const next = await post(c, '/workspace/change', { token: w.token, slot: 'tires', variantId: 'studio-tire28' }).expect(200); await post(c, '/workspace/change', { token: next.body.token, slot: 'frameset', variantId: 'studio-pursuit-forest' }).expect(422); const s = await c.agent.get('/api/session'); expect(s.body.usage.changes).toBe(1); });
  it('enforces twelve accepted changes and persists counters across reload/bootstrap', async () => { const c = await guest(); let w = await workspace(c); for (let i = 0; i < 12; i++) w = (await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: i % 2 ? 'studio-classic' : 'studio-deep' }).expect(200)).body; await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }).expect(409); const fresh = await workspace(c); const exhausted = await post(c, '/workspace/change', { token: fresh.token, slot: 'wheels', variantId: 'studio-deep' }).expect(409); expect(exhausted.body.error.code).toBe('GUEST_CHANGE_LIMIT'); expect(exhausted.body.error.details.resetAt).toBeTruthy(); expect((await c.agent.get('/api/session')).body.usage.changes).toBe(12); });
  it('serializes concurrent guest changes without exceeding twelve', async () => { const c = await guest(); const w = await workspace(c); const results = await Promise.all(Array.from({ length: 15 }, () => post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }))); expect(results.filter(r => r.status === 200)).toHaveLength(12); expect(results.filter(r => r.status === 409)).toHaveLength(3); });
  it('limits 3D grants and rejects tampered or another guest’s workspace', async () => { const c = await guest(), other = await guest(); const w = await workspace(c); await post(c, '/workspace/preview', { token: w.token }).expect(200); const denied = await post(c, '/workspace/preview', { token: w.token }).expect(409); expect(denied.body.error.code).toBe('GUEST_PREVIEW_LIMIT'); await post(other, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }).expect(400); await post(c, '/workspace/change', { token: sign({ configuration: defaultConfiguration }, 'a-wrong-secret'), slot: 'wheels', variantId: 'studio-deep' }).expect(400); });
});
describe('garage lifecycle and quota races', () => {
  it('does not refund daily creation history after deletion', async () => { const c = await member(); const created = []; for (let i = 0; i < 3; i++) created.push((await post(c, '/builds', build).expect(201)).body); await del(c, `/builds/${created[0]._id}`).expect(200); const denied = await post(c, '/builds', build).expect(409); expect(denied.body.error.code).toBe('BUILD_DAILY_LIMIT'); expect((await Subject.findById(`user:${c.userId}`))?.creates).toHaveLength(3); });
  it('serializes concurrent daily creations to exactly three', async () => { const c = await member(); const results = await Promise.all(Array.from({ length: 6 }, () => post(c, '/builds', build))); expect(results.filter(r => r.status === 201)).toHaveLength(3); expect(await Build.countDocuments({ owner: c.userId })).toBe(3); });
  it('protects the fifth active slot against concurrent creation and duplication', async () => { const c = await member(); const existing = await Build.create(Array.from({ length: 4 }, () => ({ ...build, owner: c.userId }))); const results = await Promise.all([post(c, '/builds', build), post(c, `/builds/${existing[0]._id}/duplicate`)]); expect(results.filter(r => r.status === 201)).toHaveLength(1); expect(results.filter(r => r.body.error?.code === 'BUILD_LIMIT_REACHED')).toHaveLength(1); expect(await Build.countDocuments({ owner: c.userId })).toBe(5); });
  it('enforces historical monthly quota even after all builds are deleted', async () => { const c = await member(); await Subject.create({ _id: `user:${c.userId}`, creates: Array.from({ length: 20 }, () => Date.now() - 2 * 86400000) }); const result = await post(c, '/builds', build).expect(409); expect(result.body.error.code).toBe('BUILD_MONTHLY_LIMIT'); });
  it('updates without consuming another build slot and rejects stale or concurrent editors', async () => { const c = await member(); const created = (await post(c, '/builds', build).expect(201)).body; const lease = (await post(c, `/builds/${created._id}/lease`).expect(200)).body; await post(c, `/builds/${created._id}/lease`).expect(409); const updated = await patch(c, `/builds/${created._id}`, { ...build, name: 'Updated ride', revision: 1 }, lease.editorToken).expect(200); expect(updated.body.revision).toBe(2); await patch(c, `/builds/${created._id}`, { ...build, revision: 1 }, lease.editorToken).expect(409); expect(await Build.countDocuments()).toBe(1); expect((await Subject.findById(`user:${c.userId}`))?.creates).toHaveLength(1); });
  it('isolates builds between accounts and public access', async () => { const a = await member('a@example.com'), b = await member('b@example.com'); const created = (await post(a, '/builds', build).expect(201)).body; await b.agent.get(`/api/builds/${created._id}`).expect(404); await del(b, `/builds/${created._id}`).expect(404); await post(b, `/builds/${created._id}/duplicate`).expect(404); await b.agent.get(`/api/public/builds/${created._id}`).expect(404); });
  it('requires verified email to publish and caps exports at five', async () => { const c = await member(); const created = (await post(c, '/builds', build).expect(201)).body; const lease = (await post(c, `/builds/${created._id}/lease`).expect(200)).body; await patch(c, `/builds/${created._id}`, { ...build, revision: 1, visibility: 'public' }, lease.editorToken).expect(403); for (let i = 0; i < 5; i++) await post(c, `/builds/${created._id}/export`).expect(200); const denied = await post(c, `/builds/${created._id}/export`).expect(409); expect(denied.body.error.code).toBe('EXPORT_LIMIT_REACHED'); });
});
describe('API boundaries', () => {
  it('preserves archived references and blocks changing a variant used by saved builds', async () => {
    const c = await member(); const created = (await post(c, '/builds', build).expect(201)).body;
    expect(created.catalogSnapshot).toHaveLength(6);
    await User.updateOne({ _id: c.userId }, { $set: { role: 'admin' } });
    const product = structuredClone(seedCatalog.find(p => p.id === 'studio-track')!);
    product.variants[0].specs.tireClearance = 50;
    await c.agent.put('/api/admin/catalog/studio-track').set('Origin', origin).set('X-CSRF-Token', c.csrf).send(product).expect(409);
    const archived = { ...seedCatalog.find(p => p.id === 'studio-track')!, status: 'archived' };
    await c.agent.put('/api/admin/catalog/studio-track').set('Origin', origin).set('X-CSRF-Token', c.csrf).send(archived).expect(200);
    const existing = await c.agent.get(`/api/builds/${created._id}`).expect(200);
    expect(existing.body.catalogSnapshot.find((p: { id: string }) => p.id === 'studio-track')).toBeTruthy();
    const draftAttempt = await post(c, '/builds', { ...build, configuration: { ...defaultConfiguration, frameset: 'cinelli-vigorelli-reference' } }).expect(422);
    expect(draftAttempt.body.error.code).toBe('VARIANT_UNAVAILABLE');
    const g = await guest(); const w = await workspace(g); expect(w.configuration.frameset).toBe('studio-pursuit-forest');
  });
  it('publishes only three builds and immediately revokes an unpublished share link', async () => {
    const c = await member(); await User.updateOne({ _id: c.userId }, { $set: { verified: true } });
    const builds = await Build.create(Array.from({ length: 4 }, (_, i) => ({ ...build, name: `Build ${i}`, owner: c.userId })));
    const published: { id: string; publicId: string; editorToken: string }[] = [];
    for (let i = 0; i < builds.length; i++) { const id = String(builds[i]._id); const lease = (await post(c, `/builds/${id}/lease`).expect(200)).body; const result = await patch(c, `/builds/${id}`, { ...build, revision: 1, visibility: 'public' }, lease.editorToken).expect(i < 3 ? 200 : 409); if (i < 3) published.push({ id, publicId: result.body.publicId, editorToken: lease.editorToken }); else expect(result.body.error.code).toBe('PUBLISH_LIMIT_REACHED'); }
    const first = published[0]; await c.agent.get(`/api/public/builds/${first.publicId}`).expect(200);
    await patch(c, `/builds/${first.id}`, { ...build, revision: 2, visibility: 'private' }, first.editorToken).expect(200);
    await c.agent.get(`/api/public/builds/${first.publicId}`).expect(404);
  });
  it('bounds catalog pagination, validates JSON and limits request bodies', async () => { const c = await guest(); await c.agent.get('/api/catalog?limit=99999').expect(422); await c.agent.post('/api/workspace').set('Content-Type', 'application/json').send('{oops').expect(400); await post(c, '/workspace', { extra: 'x'.repeat(40000) }).expect(413); });
  it('returns a consistent 429 and Retry-After for sensitive operations', async () => { const c = await guest(); for (let i = 0; i < 5; i++) await post(c, '/auth/login', { email: 'none@example.com', password: 'a-long-test-passphrase' }).expect(401); const r = await post(c, '/auth/login', { email: 'none@example.com', password: 'a-long-test-passphrase' }).expect(429); expect(r.body.error.code).toBe('RATE_LIMIT_EXCEEDED'); expect(Number(r.headers['retry-after'])).toBeGreaterThan(0); });
});
