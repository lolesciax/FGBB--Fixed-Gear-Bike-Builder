import mongoose from 'mongoose';
import { randomUUID, randomBytes } from 'node:crypto';
import type { Server } from 'node:http';
import { createApp } from '../backend/src/app';
import { parseConfig } from '../backend/src/config';
import { DevelopmentRateStore } from '../backend/src/security';
import { Audit, Build, RecoveryToken, Session, Subject, User } from '../backend/src/models';

// Deliberately targets only the explicitly configured TrackLab development DB.
const config = parseConfig(process.env);
if (config.NODE_ENV !== 'development' || config.MONGODB_DB_NAME !== 'tracklab_dev' || !config.MONGODB_URI) throw new Error('This check requires NODE_ENV=development and MONGODB_DB_NAME=tracklab_dev.');
const email = `persistence-check-${randomUUID()}@example.test`;
const password = randomBytes(32).toString('base64url');
let server: Server | undefined, base = '', cookie = '', csrf = '';
async function connect() {
  await mongoose.connect(config.MONGODB_URI!, { dbName: config.MONGODB_DB_NAME, serverSelectionTimeoutMS: 10000, maxPoolSize: 3 });
  const app = createApp(config, new DevelopmentRateStore(), async () => { /* No email is sent for this temporary fixture. */ });
  server = await new Promise<Server>(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Local API did not bind a TCP port.');
  base = `http://127.0.0.1:${address.port}/api`;
}
async function stop() {
  if (server) { const current = server; server = undefined; await new Promise<void>((resolve, reject) => current.close(e => e ? reject(e) : resolve())); }
  await mongoose.disconnect();
}
async function call(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${base}${path}`, { method, headers: { Cookie: cookie, Origin: config.FRONTEND_URL, 'X-CSRF-Token': csrf, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const sessionCookie = response.headers.getSetCookie().find(v => v.startsWith('tracklab='));
  if (sessionCookie) cookie = sessionCookie.split(';')[0];
  const data = await response.json();
  if (!response.ok) throw new Error(`Persistence check failed at ${method} ${path}: ${response.status} ${data.error?.code || ''}`);
  if (data.csrf) csrf = data.csrf;
  return data;
}
try {
  await connect();
  await call('/session');
  const registration = await call('/auth/register', 'POST', { name: 'Temporary persistence check', email, password });
  const fixtureId = registration.user.id;
  const workspace = await call('/workspace', 'POST', {});
  const build = await call('/builds', 'POST', { name: 'Temporary persistence check', configuration: workspace.configuration });
  // Close the API and database client completely, then use fresh instances.
  await stop();
  await connect();
  const restoredSession = await call('/session');
  if (restoredSession.user?.id !== fixtureId) throw new Error('The authenticated session did not survive reconnection.');
  const restoredBuild = await call(`/builds/${build._id}`);
  if (restoredBuild.name !== build.name || JSON.stringify(restoredBuild.configuration) !== JSON.stringify(build.configuration)) throw new Error('Saved build data did not survive reconnection.');
  const subject = await Subject.findById(`user:${fixtureId}`).lean();
  if (subject?.creates.length !== 1) throw new Error('Build-creation quota history did not survive reconnection.');
  await call('/account', 'DELETE', { password });
  console.info(JSON.stringify({ database: config.MONGODB_DB_NAME, sessionPersisted: true, savedBuildPersisted: true, quotaHistoryPersisted: true, temporaryAccountDeleted: true, deployed: false }));
} catch (error) {
  console.error(JSON.stringify({ verified: false, errorType: (error as Error).name, message: 'Persistence verification failed; credentials were not printed.' }));
  process.exitCode = 1;
} finally {
  // If an assertion failed, remove only the fixture identified by its random email.
  try {
    if (mongoose.connection.readyState !== 1) await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DB_NAME, serverSelectionTimeoutMS: 10000 });
    const ownFixture = await User.findOne({ email });
    if (ownFixture) {
      const id = ownFixture._id;
      await mongoose.connection.transaction(async session => {
        await Build.deleteMany({ owner: id }, { session });
        await Session.deleteMany({ userId: id }, { session });
        await RecoveryToken.deleteMany({ userId: id }, { session });
        await Subject.deleteOne({ _id: `user:${id}` }, { session });
        await Audit.deleteMany({ actor: String(id) }, { session });
        await User.deleteOne({ _id: id, email }, { session });
      });
    }
  } catch { console.error('Temporary fixture cleanup could not be verified.'); process.exitCode = 1; }
  await stop();
}
