import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request, { type Agent } from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile,unlink } from 'node:fs/promises';
import { createApp } from '../backend/src/app';
import { parseConfig } from '../backend/src/config';
import { DevelopmentRateStore, sign } from '../backend/src/security';
import { Build, ProductModel, Subject, User, initializeModels, Session, Audit } from '../backend/src/models';
import { seedCatalog, defaultConfiguration } from '../backend/src/catalog';
import { importCatalog } from '../backend/src/catalog-import';
import { Brand, ModelRecordModel, AssetReview } from '../backend/src/models';
const origin = 'http://localhost:5173';
const config = parseConfig({ NODE_ENV: 'test', FRONTEND_URL: origin });
let repl: MongoMemoryReplSet, app: ReturnType<typeof createApp>;
let letters: { email: string; kind: string; token: string }[];
const testServers:ReturnType<typeof createServer>[]=[];
type Client = { agent: Agent; csrf: string; userId?: string; guestCookie: string };
async function guest(): Promise<Client> { const server = createServer((req,res)=>app(req,res)); await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve)); testServers.push(server); const agent = request.agent(server); const s = await agent.get('/api/session').expect(200); const guestCookie = (s.headers['set-cookie'] as unknown as string[]).find(value => value.startsWith('tracklab-guest='))?.split(';')[0]; if (!guestCookie) throw new Error('Guest usage cookie was not issued.'); return { agent, csrf: s.body.csrf, guestCookie }; }
function post(c: Client, path: string, body: object = {}) { return c.agent.post(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf).send(body); }
function patch(c: Client, path: string, body: object = {}, editorToken = '') { return c.agent.patch(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf).set('X-Editor-Token', editorToken).send(body); }
function del(c: Client, path: string) { return c.agent.delete(`/api${path}`).set('Origin', origin).set('X-CSRF-Token', c.csrf); }
async function member(email = 'rider@example.com') { const c = await guest(); const r = await post(c, '/auth/register', { name: 'Rider', email, password: 'a-long-test-passphrase' }).expect(201); c.csrf = r.body.csrf; c.userId = r.body.user.id; return c; }
async function workspace(c: Client) { return (await post(c, '/workspace').expect(200)).body; }
const build = { name: 'Daily rider', configuration: defaultConfiguration };
beforeAll(async () => { repl = await MongoMemoryReplSet.create({ binary: { downloadDir: resolve('.local/mongodb') }, replSet: { count: 1, storageEngine: 'wiredTiger' } }); await mongoose.connect(repl.getUri('tracklab-test')); await initializeModels(); });
beforeEach(async () => { for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({}); for (const p of seedCatalog) await ProductModel.create({ _id: p.id, data: p }); letters = []; app = createApp(config, new DevelopmentRateStore(), async (email, kind, token) => { letters.push({ email, kind, token }); }); });
afterAll(async () => { await mongoose.disconnect(); await repl?.stop(); });
afterEach(async()=>{await Promise.all(testServers.splice(0).map(server=>new Promise<void>(resolve=>server.close(()=>resolve()))));});
describe('authentication and authorization', () => {
  it('protects and audits bounded policy changes while preserving existing builds',async()=>{
    const c=await member();await c.agent.get('/api/admin/policy').expect(403);
    await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    const original=(await c.agent.get('/api/admin/policy').expect(200)).body;
    expect(original.policy.builds).toBe(8);expect(original.policy.guestChanges).toBe(24);
    const request=()=>c.agent.put('/api/admin/policy').set('Origin',origin).set('X-CSRF-Token',c.csrf);
    await request().send({version:original.version,policy:{...original.policy,builds:999}}).expect(422);
    await Build.create(Array.from({length:3},()=>({...build,owner:c.userId})));
    await request().send({version:original.version,policy:{...original.policy,builds:2}}).expect(200);
    expect(await Build.countDocuments()).toBe(3);
    await post(c,'/builds',build).expect(409);
    expect((await c.agent.get('/api/session')).body.policy.builds).toBe(2);
    await request().send({version:original.version,policy:original.policy}).expect(409);
    expect(await Audit.countDocuments({action:'policy.update'})).toBe(1);
  });
  it('exports owned illustrations as SVG and shares the eight-export allowance with information exports',async()=>{
    const c=await member(),g=await guest(),created=(await post(c,'/builds',build).expect(201)).body;
    await post(g,`/builds/${created._id}/export-image`).expect(401);
    const picture=(await post(c,`/builds/${created._id}/export-image`).expect(200)).body;
    expect(picture.svg).toContain('<svg xmlns=');expect(picture.svg).toContain(defaultConfiguration.frameset);expect(picture.svg).not.toContain('<script');
    expect(picture.filename).toBe('Daily-rider.svg');
    for(let i=1;i<8;i++)await post(c,`/builds/${created._id}/export`).expect(200);
    await post(c,`/builds/${created._id}/export-image`).expect(409);
  });
  it('bypasses only business quotas in development and restores existing history when disabled',async()=>{
    const send=async(email:string,kind:'verify'|'reset',token:string)=>{letters.push({email,kind,token});};
    app=createApp({...config,DEVELOPMENT_DISABLE_QUOTAS:true},new DevelopmentRateStore(),send);
    const g=await guest(),w=await workspace(g);
    const initial=await post(g,'/workspace/change',{token:w.token,slot:'wheels',variantId:'studio-deep'}).expect(200);
    const guestSubject=await Subject.findOne();
    await Subject.updateOne({_id:guestSubject!._id},{$set:{changes:Array(24).fill(Date.now()),previews:Array(2).fill(Date.now())}});
    const changed=await post(g,'/workspace/change',{token:initial.body.token,slot:'wheels',variantId:'studio-classic'}).expect(200);
    const preview=await post(g,'/workspace/preview',{token:changed.body.token}).expect(200);expect(Date.parse(preview.body.expiresAt)-Date.now()).toBeGreaterThan(23*3600000);
    expect((await g.agent.get('/api/session')).body).toMatchObject({developmentUnlimited:true,usage:{changes:25,previews:3}});
    await post(g,'/builds',build).expect(401);
    const c=await member();
    await Build.create(Array.from({length:8},()=>({...build,owner:c.userId})));
    await Subject.create({_id:`user:${c.userId}`,creates:Array(15).fill(Date.now()),exports:Array(8).fill(Date.now()),saves:Array(120).fill(Date.now())});
    const ninth=(await post(c,'/builds',build).expect(201)).body;
    await post(c,`/builds/${ninth._id}/export`).expect(200);
    const lease=(await post(c,`/builds/${ninth._id}/lease`).expect(200)).body;
    await patch(c,`/builds/${ninth._id}`,{...build,revision:1,visibility:'public'},lease.editorToken).expect(403);
    await patch(c,`/builds/${ninth._id}`,{...build,revision:1},lease.editorToken).expect(200);
    const other=await member('development-other@example.com');await other.agent.get(`/api/builds/${ninth._id}`).expect(404);
    await g.agent.post('/api/workspace/change').set('Origin',origin).send({token:changed.body.token,slot:'wheels',variantId:'studio-deep'}).expect(403);
    app=createApp(config,new DevelopmentRateStore(),send);
    await post(g,'/workspace/change',{token:changed.body.token,slot:'wheels',variantId:'studio-deep'}).expect(409);
    await post(c,'/builds',build).expect(409);expect(await Build.countDocuments({owner:c.userId})).toBe(9);
  });
  it('archives individual variants without removing saved selections or allowing new selection of retired variants',async()=>{
    const c=await member(),w=await workspace(c);
    const saved=(await post(c,'/builds',build).expect(201)).body;
    await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    const product=structuredClone(seedCatalog.find(p=>p.id==='studio-track')!);
    product.variants.find(v=>v.id===defaultConfiguration.frameset)!.status='archived';
    await c.agent.put('/api/admin/catalog/studio-track').set('Origin',origin).set('X-CSRF-Token',c.csrf).send(product).expect(200);
    const item=(await c.agent.get('/api/catalog/studio-track').expect(200)).body;
    expect(item.variants.some((v:{id:string})=>v.id===defaultConfiguration.frameset)).toBe(false);
    const changed=await post(c,'/workspace/change',{token:w.token,slot:'wheels',variantId:'studio-deep'}).expect(200);
    expect(changed.body.configuration.frameset).toBe(defaultConfiguration.frameset);
    await c.agent.get(`/api/builds/${saved._id}`).expect(200);
    const g=await guest(),gw=await workspace(g);
    await post(g,'/workspace/change',{token:gw.token,slot:'frameset',variantId:defaultConfiguration.frameset}).expect(422);
  });
  it('keeps rights-attested uploads private and pending, rejecting external-resource models and unprivileged uploads',async()=>{
    const c=await member();
    const query=new URLSearchParams({productId:'skream-magnum',filename:'frame.glb',license:'Original CC0 geometry',evidence:'https://example.com/permission',permission:'confirmed'});
    const upload=(bytes:Buffer)=>c.agent.post('/api/admin/asset-reviews?'+query).set('Origin',origin).set('X-CSRF-Token',c.csrf).set('Content-Type','model/gltf-binary').send(bytes);
    const data=await readFile(resolve('frontend/public/models/frames/skream-magnum-m.glb'));
    await upload(data).expect(403);await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    await upload(Buffer.from('not a model file')).expect(422);
    const external=Buffer.from(JSON.stringify({asset:{version:'2.0'},buffers:[{uri:'https://example.com/external.bin'}]}));
    const invalid=Buffer.alloc(20+external.length);invalid.write('glTF');invalid.writeUInt32LE(2,4);invalid.writeUInt32LE(invalid.length,8);invalid.writeUInt32LE(external.length,12);invalid.writeUInt32LE(0x4e4f534a,16);external.copy(invalid,20);
    await upload(invalid).expect(422);
    const uploaded=(await upload(data).expect(201)).body;expect(uploaded.status).toBe('pending');
    const stored=await AssetReview.findById(uploaded.id).lean();expect(stored?.bytes).toBe(data.length);
    const listing=(await c.agent.get('/api/admin/asset-reviews').expect(200)).body.items;
    expect(listing[0].storageKey).toBeUndefined();
    const download=await c.agent.get(`/api/admin/asset-reviews/${uploaded.id}/file`).expect(200);expect(download.headers['content-disposition']).toContain('attachment');
    expect((await ProductModel.findById('skream-magnum'))?.data.variants.find((v:{id:string})=>v.id==='skream-magnum-m').asset3D.url).toBe('/models/frames/skream-magnum-m.glb');
    expect(stored?.storageKey).toMatch(/^[a-f0-9-]+\.glb$/);
    await unlink(resolve('.local/test-asset-review',stored!.storageKey!));
  });
  it('applies dependent frame/seating changes atomically, charges per changed slot and deduplicates retries',async()=>{
    const c=await guest(),w=await workspace(c);
    await post(c,'/workspace/change',{token:w.token,slot:'frameset',variantId:'skream-magnum-m'}).expect(422);
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(0);
    const input={token:w.token,slot:'frameset',variantId:'skream-magnum-m',replacements:{saddle:'studio-race-316'}};
    const first=await post(c,'/workspace/change',input).expect(200);
    await post(c,'/workspace/change',input).expect(200);
    expect(first.body.configuration).toMatchObject({frameset:'skream-magnum-m',saddle:'studio-race-316'});
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(2);
    await post(c,'/workspace/preview',{token:first.body.token}).expect(200);
    await post(c,'/workspace/change',{...input,replacements:{saddle:'studio-classic'}}).expect(422);
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(2);
  });
  it('rolls back an entire dependent change when only one guest change remains',async()=>{
    const c=await guest(),w=await workspace(c),subject=await Subject.findOne();
    // Initialize this guest's usage subject through one accepted replacement.
    await post(c,'/workspace/change',{token:w.token,slot:'wheels',variantId:'studio-deep'}).expect(200);
    const usage=await Subject.findOne();expect(subject).toBeNull();
    await Subject.updateOne({_id:usage!._id},{$set:{changes:Array(23).fill(Date.now())}});
    await post(c,'/workspace/change',{token:w.token,slot:'frameset',variantId:'skream-magnum-m',replacements:{saddle:'studio-race-316'}}).expect(409);
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(23);
  });
  it('keeps model research distinct from selectable products and preserves edited registry records', async()=>{
    await importCatalog(); const c=await guest();
    const brands=(await c.agent.get('/api/brands').expect(200)).body.items;
    expect(brands.map((b:{name:string})=>b.name)).toEqual(expect.arrayContaining(['Tsunami','Skream','Engine11','Leader','Wabi Cycles','Surly']));
    const models=(await c.agent.get('/api/models').expect(200)).body.items;
    const snm200=models.find((m:{id:string})=>m.id==='tsunami-snm200');
    expect(snm200).toMatchObject({published:false,renderingFidelity:'unavailable',specificationStatus:'unverified',support:['Research Pending']});
    await ModelRecordModel.updateOne({_id:'tsunami-snm200'},{$set:{'data.notes':'Administrator review retained'}});
    await importCatalog(); expect((await ModelRecordModel.findById('tsunami-snm200'))?.data.notes).toBe('Administrator review retained');
    const w=await workspace(c); await post(c,'/workspace/change',{token:w.token,slot:'frameset',variantId:'tsunami-snm200'}).expect(422);
  });
  it('authorizes and audits dynamic brand/model maintenance without implying rendering support',async()=>{
    const c=await member();
    const brand={id:'review-brand',name:'Review Brand',description:'Research fixture',source:'https://example.com/',reviewedAt:new Date().toISOString(),categories:['frameset']};
    const put=(path:string,body:object)=>c.agent.put(`/api${path}`).set('Origin',origin).set('X-CSRF-Token',c.csrf).send(body);
    await put('/admin/brands/review-brand',brand).expect(403);
    await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    await put('/admin/brands/review-brand',brand).expect(200);
    const model={id:'research-frame',brandId:'review-brand',name:'Research frame',source:'https://example.com/frame',checkedAt:new Date().toISOString(),specificationStatus:'unverified',notes:'No dimensions or assets reviewed.'};
    await put('/admin/models/research-frame',{...model,brandId:'missing-brand'}).expect(422);
    await put('/admin/models/research-frame',{...model,productId:'studio-track'}).expect(422);
    await put('/admin/models/research-frame',model).expect(200);
    expect(await Audit.countDocuments({actor:c.userId,action:{$in:['brand.update','model.update']}})).toBe(2);
    const directory=(await c.agent.get('/api/models').expect(200)).body.items;
    expect(directory.find((m:{id:string})=>m.id===model.id).support).toEqual(['Research Pending']);
  });
  it('upgrades the old draft placeholder but retains an edited research draft', async()=>{
    const placeholder={id:'cinelli-vigorelli',brand:'Cinelli',name:'Vigorelli frame-kit',slot:'frameset',status:'draft',illustrative:false,description:'Manufacturer reference record. Authentic model geometry and licensed product assets are not registered, so selection is unavailable.',variants:[{id:'cinelli-vigorelli-reference',label:'Reference only',color:'#808080',specs:{}}]};
    await ProductModel.updateOne({_id:placeholder.id},{$set:{data:placeholder}});
    await importCatalog();
    expect((await ProductModel.findById(placeholder.id))?.data.variants).toHaveLength(seedCatalog.find(p=>p.id===placeholder.id)!.variants.length);
    await ProductModel.updateOne({_id:placeholder.id},{$set:{data:{...placeholder,name:'Edited research draft'}}});
    await importCatalog();
    expect((await ProductModel.findById(placeholder.id))?.data.name).toBe('Edited research draft');
  });
  it('imports manufacturer records idempotently without overwriting reviewed catalog data', async () => {
    await importCatalog(); await importCatalog();
    expect(await Brand.countDocuments()).toBe(11);
    expect(await ProductModel.countDocuments()).toBe(seedCatalog.length);
    await ProductModel.updateOne({_id:'cinelli-vigorelli'},{$set:{'data.status':'archived','data.name':'Reviewed archived frame'}});
    await importCatalog();
    expect((await ProductModel.findById('cinelli-vigorelli'))?.data.name).toBe('Reviewed archived frame');
    const c=await guest();const response=await c.agent.get('/api/catalog?brand=Dosnoventa').expect(200);
    expect(response.body.items).toHaveLength(3);
    expect(response.body.items.every((p:{visual:{fidelity:string}})=>p.visual.fidelity==='measurement-schematic')).toBe(true);
    const w=await workspace(c);
    const changed=await post(c,'/workspace/change',{token:w.token,slot:'frameset',variantId:'dosnoventa-02-la-m'}).expect(200);
    await post(c,'/workspace/preview',{token:changed.body.token}).expect(200);
    await ProductModel.updateOne({_id:'dosnoventa-02-la'},{$unset:{'data.visual':1}});
    await post(c,'/workspace/preview',{token:changed.body.token}).expect(422);
  });
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
  it('enforces 24 accepted changes and persists counters across reload/bootstrap', async () => { const c = await guest(); let w = await workspace(c); for (let i = 0; i < 24; i++) w = (await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: i % 2 ? 'studio-classic' : 'studio-deep' }).expect(200)).body; await post(c, '/workspace/change', { token: w.token, slot: 'wheels', variantId: 'studio-deep' }).expect(409); const fresh = await workspace(c); const exhausted = await post(c, '/workspace/change', { token: fresh.token, slot: 'wheels', variantId: 'studio-deep' }).expect(409); expect(exhausted.body.error.code).toBe('GUEST_CHANGE_LIMIT'); expect(exhausted.body.error.details.resetAt).toBeTruthy(); expect((await c.agent.get('/api/session')).body.usage.changes).toBe(24); });
  it('serializes concurrent changes at the configured cap and deduplicates identical operations',async()=>{
    // Exercise the same boundary with fewer contending transactions; the default 24 is verified above.
    app=createApp({...config,GUEST_CHANGES:4},new DevelopmentRateStore(),async(email,kind,token)=>{letters.push({email,kind,token});});
    const c=await guest(),w=await workspace(c);
    await Promise.all(Array.from({length:8},()=>post(c,'/workspace/change',{token:w.token,slot:'wheels',variantId:'studio-deep'}).expect(200)));
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(1);
    const options=seedCatalog.filter(p=>p.status==='published').flatMap(p=>p.variants.filter(v=>v.id!==defaultConfiguration[p.slot]).map(v=>({slot:p.slot,variantId:v.id}))).filter(v=>v.variantId!=='studio-deep').slice(0,8);
    const results=await Promise.all(options.map(value=>post(c,'/workspace/change',{token:w.token,...value})));
    expect(results.filter(r=>r.status===200)).toHaveLength(3);expect(results.filter(r=>r.status===409)).toHaveLength(5);
    expect((await c.agent.get('/api/session')).body.usage.changes).toBe(4);
  });
  it('reuses a valid 10-minute 3D grant, permits two sessions, and validates expiry and identity',async()=>{
    const c=await guest(),other=await guest(),w=await workspace(c);
    const first=(await post(c,'/workspace/preview',{token:w.token}).expect(200)).body;
    expect(Date.parse(first.expiresAt)-Date.now()).toBeLessThanOrEqual(600000);
    const reused=(await post(c,'/workspace/preview',{token:w.token}).expect(200)).body;
    expect(reused.grant).toBe(first.grant);
    await post(c,'/workspace/preview/validate',{grant:first.grant}).expect(200);
    await post(other,'/workspace/preview/validate',{grant:first.grant}).expect(409);
    await Subject.updateMany({},{$set:{previewUntil:new Date(0)}});
    await post(c,'/workspace/preview/validate',{grant:first.grant}).expect(409);
    await post(c,'/workspace/preview',{token:w.token}).expect(200);
    await Subject.updateMany({},{$set:{previewUntil:new Date(0)}});
    expect((await post(c,'/workspace/preview',{token:w.token}).expect(409)).body.error.code).toBe('GUEST_PREVIEW_LIMIT');
    await post(other,'/workspace/change',{token:w.token,slot:'wheels',variantId:'studio-deep'}).expect(400);
    await post(c,'/workspace/change',{token:sign({configuration:defaultConfiguration},'a-wrong-secret'),slot:'wheels',variantId:'studio-deep'}).expect(400);
  });
});
describe('garage lifecycle and quota races', () => {
  it('does not refund daily creation history after deletion', async () => { const c = await member(); const created = []; for (let i = 0; i < 3; i++) created.push((await post(c, '/builds', build).expect(201)).body); await del(c, `/builds/${created[0]._id}`).expect(200); const denied = await post(c, '/builds', build).expect(409); expect(denied.body.error.code).toBe('BUILD_DAILY_LIMIT'); expect((await Subject.findById(`user:${c.userId}`))?.creates).toHaveLength(3); });
  it('serializes concurrent daily creations to exactly three', async () => { const c = await member(); const results = await Promise.all(Array.from({ length: 6 }, () => post(c, '/builds', build))); expect(results.filter(r => r.status === 201)).toHaveLength(3); expect(await Build.countDocuments({ owner: c.userId })).toBe(3); });
  it('protects the eighth active slot against concurrent creation and duplication', async () => { const c = await member(); const existing = await Build.create(Array.from({ length: 7 }, () => ({ ...build, owner: c.userId }))); const results = await Promise.all([post(c, '/builds', build), post(c, `/builds/${existing[0]._id}/duplicate`)]); expect(results.filter(r => r.status === 201)).toHaveLength(1); expect(results.filter(r => r.body.error?.code === 'BUILD_LIMIT_REACHED')).toHaveLength(1); expect(await Build.countDocuments({ owner: c.userId })).toBe(8); });
  it('enforces historical monthly quota even after all builds are deleted', async () => { const c = await member(); await Subject.create({ _id: `user:${c.userId}`, creates: Array.from({ length: 15 }, () => Date.now() - 2 * 86400000) }); const result = await post(c, '/builds', build).expect(409); expect(result.body.error.code).toBe('BUILD_MONTHLY_LIMIT'); });
  it('updates without consuming another build slot and rejects stale or concurrent editors', async () => { const c = await member(); const created = (await post(c, '/builds', build).expect(201)).body; const lease = (await post(c, `/builds/${created._id}/lease`).expect(200)).body; await post(c, `/builds/${created._id}/lease`).expect(409); const updated = await patch(c, `/builds/${created._id}`, { ...build, name: 'Updated ride', revision: 1 }, lease.editorToken).expect(200); expect(updated.body.revision).toBe(2); await patch(c, `/builds/${created._id}`, { ...build, revision: 1 }, lease.editorToken).expect(409); expect(await Build.countDocuments()).toBe(1); expect((await Subject.findById(`user:${c.userId}`))?.creates).toHaveLength(1); });
  it('isolates builds between accounts and public access', async () => { const a = await member('a@example.com'), b = await member('b@example.com'); const created = (await post(a, '/builds', build).expect(201)).body; await b.agent.get(`/api/builds/${created._id}`).expect(404); await del(b, `/builds/${created._id}`).expect(404); await post(b, `/builds/${created._id}/duplicate`).expect(404); await b.agent.get(`/api/public/builds/${created._id}`).expect(404); });
  it('requires verified email to publish and caps exports at eight', async () => { const c = await member(); const created = (await post(c, '/builds', build).expect(201)).body; const lease = (await post(c, `/builds/${created._id}/lease`).expect(200)).body; await patch(c, `/builds/${created._id}`, { ...build, revision: 1, visibility: 'public' }, lease.editorToken).expect(403); for (let i = 0; i < 8; i++) await post(c, `/builds/${created._id}/export`).expect(200); const denied = await post(c, `/builds/${created._id}/export`).expect(409); expect(denied.body.error.code).toBe('EXPORT_LIMIT_REACHED'); });
});
describe('API boundaries', () => {
  it('allows reviewed manufacturer maintenance while rejecting missing provenance or unregistered assets',async()=>{
    const c=await member();await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    const reviewed=structuredClone(seedCatalog.find(p=>p.id==='cinelli-vigorelli')!);
    const put=(body:object)=>c.agent.put('/api/admin/catalog/cinelli-vigorelli').set('Origin',origin).set('X-CSRF-Token',c.csrf).send(body);
    await put(reviewed).expect(200);
    await put({...reviewed,provenance:undefined}).expect(422);
    reviewed.variants[0].asset3D={...reviewed.variants[0].asset3D!,url:'/models/frames/not-reviewed.glb'};
    await put(reviewed).expect(422);
  });
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
  it('publishes only four builds and immediately revokes an unpublished share link', async () => {
    const c = await member(); await User.updateOne({ _id: c.userId }, { $set: { verified: true } });
    const builds = await Build.create(Array.from({ length: 5 }, (_, i) => ({ ...build, name: `Build ${i}`, owner: c.userId })));
    const published: { id: string; publicId: string; editorToken: string }[] = [];
    for (let i = 0; i < builds.length; i++) { const id = String(builds[i]._id); const lease = (await post(c, `/builds/${id}/lease`).expect(200)).body; const result = await patch(c, `/builds/${id}`, { ...build, revision: 1, visibility: 'public' }, lease.editorToken).expect(i < 4 ? 200 : 409); if (i < 4) published.push({ id, publicId: result.body.publicId, editorToken: lease.editorToken }); else expect(result.body.error.code).toBe('PUBLISH_LIMIT_REACHED'); }
    const first = published[0]; await c.agent.get(`/api/public/builds/${first.publicId}`).expect(200);
    await patch(c, `/builds/${first.id}`, { ...build, revision: 2, visibility: 'private' }, first.editorToken).expect(200);
    await c.agent.get(`/api/public/builds/${first.publicId}`).expect(404);
  });
  it("upgrades only the original illustrative asset registration without overwriting edited technical data", async () => {
    const product = seedCatalog.find(
        (p) => p.variants[0].asset3D?.revision === "frame-kit-v2",
      )!,
      variant = product.variants[0];
    await ProductModel.updateOne(
      { _id: product.id },
      { $set: { "data.variants.0.asset3D.revision": "frame-kit-v1" } },
    );
    await importCatalog();
    let stored = await ProductModel.findById(product.id).lean();
    expect(stored!.data.variants[0].asset3D.revision).toBe("frame-kit-v2");
    expect(stored!.data.variants[0].specs).toEqual(variant.specs);
    await ProductModel.updateOne(
      { _id: product.id },
      {
        $set: {
          "data.variants.0.asset3D.revision": "frame-kit-v1",
          "data.variants.0.specs.reach": 123,
        },
      },
    );
    await importCatalog();
    stored = await ProductModel.findById(product.id).lean();
    expect(stored!.data.variants[0].specs.reach).toBe(123);
    expect(stored!.data.variants[0].asset3D.revision).toBe("frame-kit-v1");
  });
  it('appends colorways idempotently only to untouched legacy seed products',async()=>{
    const p=structuredClone(seedCatalog.find(p=>p.id==='dosnoventa-02-la')!);
    const legacy={...p,variants:p.variants.filter(v=>!v.colorwayId)};delete legacy.colorways;
    await ProductModel.replaceOne({_id:p.id},{_id:p.id,data:legacy});
    await importCatalog();await importCatalog();
    let stored=(await ProductModel.findById(p.id))!.data;
    expect(stored.variants).toHaveLength(p.variants.length);expect(stored.colorways).toHaveLength(2);
    legacy.variants[0].specs.reach=123;await ProductModel.replaceOne({_id:p.id},{_id:p.id,data:legacy});
    expect((await ProductModel.findById(p.id))!.data.colorways).toBeUndefined();
    await importCatalog();
    stored=(await ProductModel.findById(p.id))!.data;expect(stored.colorways).toBeUndefined();expect(stored.variants[0].specs.reach).toBe(123);
  });
  it('prevents used colorway edits and retains saved paint when a definition is archived',async()=>{
    const c=await member();await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    const p=structuredClone(seedCatalog.find(p=>p.id==='cinelli-vigorelli')!),cw=p.colorways![0];
    const v=p.variants.find(v=>v.colorwayId===cw.id&&v.specs.size==='M')!;
    const created=(await post(c,'/builds',{name:'Pinned blue',configuration:{...defaultConfiguration,frameset:v.id}}).expect(201)).body;
    const put=()=>c.agent.put('/api/admin/catalog/'+p.id).set('Origin',origin).set('X-CSRF-Token',c.csrf);
    const changed=structuredClone(p);changed.colorways![0].paint.color='#ff0000';
    expect((await put().send(changed).expect(409)).body.error.code).toBe('REFERENCED_COLORWAY_IMMUTABLE');
    p.colorways![0].status='archived';await put().send(p).expect(200);
    const publicProduct=(await c.agent.get('/api/catalog/'+p.id).expect(200)).body;
    expect(publicProduct.variants.some((n:{id:string})=>n.id===v.id)).toBe(false);
    const picture=(await post(c,`/builds/${created._id}/export-image`).expect(200)).body.svg;
    expect(picture).toContain(cw.id);expect(picture).toContain('#47b9d0');
    const duplicate=(await post(c,`/builds/${created._id}/duplicate`).expect(201)).body;
    expect(duplicate.catalogSnapshot.find((n:{id:string})=>n.id===p.id).colorways[0].status).toBe('published');
  });
  it('serves artwork only after admin rights review and explicit model-specific publication, and embeds exports',async()=>{
    const c=await member(),g=await guest();await User.updateOne({_id:c.userId},{$set:{role:'admin'}});
    const query=new URLSearchParams({productId:'studio-track',filename:'original-calibration.png',license:'CC0-1.0',evidence:'https://example.com/original-calibration',permission:'confirmed'});
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZkAAAAASUVORK5CYII=','base64');
    const uploaded=(await c.agent.post('/api/admin/asset-reviews?'+query).set('Origin',origin).set('X-CSRF-Token',c.csrf).set('Content-Type','image/png').send(png).expect(201)).body;
    const item=(await AssetReview.findById(uploaded.id))!;
    try {
      const path=`/api/colorway-assets/${uploaded.id}/${item.sha256}`;
      await g.agent.get(path).expect(404);await post(g,`/admin/asset-reviews/${uploaded.id}/approve`,{permission:'confirmed',review:'Original calibration artwork with no manufacturer graphics.'}).expect(401);
      const p=structuredClone(seedCatalog.find(p=>p.id==='studio-track')!),base=p.variants[0];
      const colorway={...structuredClone(seedCatalog.find(p=>p.id==='cinelli-vigorelli')!.colorways![0]),id:'studio-calibration-v1',productId:p.id,name:'Original calibration',sizes:['M'],regions:[],missingGraphics:[],graphics:[{id:'original-raster',zone:'down',side:'both',from:.25,to:.6,width:200,height:20,license:'CC0-1.0',evidence:'https://example.com/original-calibration',permission:'confirmed',raster:{reviewId:uploaded.id,sha256:item.sha256}}]};
      p.colorways=[colorway as NonNullable<typeof p.colorways>[number]];p.variants.push({...base,id:'studio-calibration-m-v1',colorwayId:colorway.id,geometryVariantId:base.id,specs:{...base.specs,size:'M'}});
      const put=()=>c.agent.put('/api/admin/catalog/'+p.id).set('Origin',origin).set('X-CSRF-Token',c.csrf).send(p);
      expect((await put().expect(422)).body.error.code).toBe('COLORWAY_ASSET_UNAVAILABLE');
      await post(c,`/admin/asset-reviews/${uploaded.id}/approve`,{permission:'confirmed',review:'Original calibration artwork created for the isolated test; CC0 permission reviewed.'}).expect(200);
      await g.agent.get(path).expect(404);await put().expect(200);await g.agent.get(path).expect(200).expect('Content-Type',/image\/png/);
      const created=(await post(c,'/builds',{name:'Raster export',configuration:{...defaultConfiguration,frameset:'studio-calibration-m-v1'}}).expect(201)).body;
      // Layer identifiers are scoped to one colorway; another model's draft
      // with the same layer ID must never replace this build's approved raster.
      await ProductModel.updateOne({_id:'studio-pursuit'},{$set:{'data.colorways':[{...colorway,id:'other-model-draft',productId:'studio-pursuit',status:'draft',graphics:[{...colorway.graphics[0],raster:{reviewId:uploaded.id,sha256:'0'.repeat(64)}}]}]}});
      const svg=(await post(c,`/builds/${created._id}/export-image`).expect(200)).body.svg;
      expect(svg).toContain('data:image/png;base64,');expect(svg).not.toContain('/api/colorway-assets/');
      p.colorways![0].status='archived';await put().expect(200);
      await g.agent.get(path).expect(404);await c.agent.get(path).expect(200).expect('Cache-Control','private, no-store');
      await Build.updateOne({_id:created._id},{$set:{visibility:'public',publicId:'original-calibration-public'}});
      await g.agent.get(path).expect(200);
      expect(await Audit.countDocuments({action:'asset.approve',target:uploaded.id})).toBe(1);
    }finally{await unlink(resolve('.local/test-asset-review',item.storageKey!));}
  });
  it('bounds catalog pagination, validates JSON and limits request bodies', async () => { const c = await guest(); await c.agent.get('/api/catalog?limit=99999').expect(422); await c.agent.post('/api/workspace').set('Content-Type', 'application/json').send('{oops').expect(400); await post(c, '/workspace', { extra: 'x'.repeat(40000) }).expect(413); });
  it('returns a consistent 429 and Retry-After for sensitive operations', async () => { const c = await guest(); for (let i = 0; i < 5; i++) await post(c, '/auth/login', { email: 'none@example.com', password: 'a-long-test-passphrase' }).expect(401); const r = await post(c, '/auth/login', { email: 'none@example.com', password: 'a-long-test-passphrase' }).expect(429); expect(r.body.error.code).toBe('RATE_LIMIT_EXCEEDED'); expect(Number(r.headers['retry-after'])).toBeGreaterThan(0); });
});
