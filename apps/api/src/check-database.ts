import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { parseConfig } from './config';

const config = parseConfig(process.env);
if (!config.MONGODB_URI) throw new Error('Set MONGODB_URI in the ignored root .env file before running npm run db:check.');
try {
  await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000, maxPoolSize: 2, ...(config.MONGODB_DB_NAME ? { dbName: config.MONGODB_DB_NAME } : {}) });
  const db = mongoose.connection.db!;
  await db.command({ ping: 1 });
  const hello = await db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid') throw new Error('TrackLab needs a replica set or an Atlas cluster because build quotas use transactions.');
  const collectionName = '_tracklab_connection_checks';
  try { await db.createCollection(collectionName); } catch (error) { if ((error as { code?: number }).code !== 48) throw error; }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const collection = db.collection(collectionName);
      const document = { probeId: randomUUID(), purpose: 'transaction-permission-check' };
      await collection.insertOne(document, { session });
      await collection.deleteOne({ probeId: document.probeId }, { session });
    });
  } finally { await session.endSession(); }
  console.info(JSON.stringify({ connected: true, database: db.databaseName, transactions: 'verified', credentialsPrinted: false }));
} catch (error) {
  const code = (error as { code?: string | number }).code;
  const name = (error as Error).name;
  const internalMessage = (error as Error).message;
  const message = code === 18 || /authentication failed/i.test(internalMessage)
    ? 'Atlas rejected the database credentials. Check the database username and URI-encoded password in .env.'
    : /querySrv|ENOTFOUND|ECONNREFUSED|server selection|timed out/i.test(internalMessage)
      ? 'Atlas could not be reached. Check the cluster hostname, cluster status, and the IP access list for this computer.'
      : code === 13
        ? 'The database user needs read/write permissions on the configured development database.'
        : 'The database check failed. Verify the Atlas URI, database access, and replica-set transaction support.';
  console.error(JSON.stringify({ connected: false, code: code ?? name, message, credentialsPrinted: false }));
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
