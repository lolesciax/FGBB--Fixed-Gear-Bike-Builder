import mongoose from 'mongoose';
import { createClient, type RedisClientType } from 'redis';
import { parseConfig } from './config';
import { createApp } from './app';
import { DevelopmentRateStore, RedisRateStore, type RateStore } from './security';
import { initializeModels, ProductModel } from './models';
import { seedCatalog } from './catalog';
import { mailer } from './mail';

const config = parseConfig(process.env);
let stopDatabase: (() => Promise<void>) | undefined;
let mongoUri = config.MONGODB_URI;
if (!mongoUri && config.NODE_ENV !== 'production' && config.DEVELOPMENT_EPHEMERAL) {
  const { MongoMemoryReplSet } = await import('mongodb-memory-server');
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  mongoUri = repl.getUri('tracklab'); stopDatabase = () => repl.stop().then(() => undefined);
  console.warn('EPHEMERAL DEVELOPMENT: database and rate counters reset when the server restarts. Never use this mode for public hosting.');
}
if (!mongoUri) throw new Error('MONGODB_URI is required. For an isolated local preview only, set DEVELOPMENT_EPHEMERAL=true.');
await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 20, ...(config.MONGODB_DB_NAME ? { dbName: config.MONGODB_DB_NAME } : {}) });
await initializeModels();
for (const p of seedCatalog) await ProductModel.updateOne({ _id: p.id }, { $setOnInsert: { data: p } }, { upsert: true });
let rate: RateStore;
let stopRedis: (() => Promise<void>) | undefined;
if (config.REDIS_URL) {
  const redis = createClient({ url: config.REDIS_URL, socket: { connectTimeout: 10000, reconnectStrategy: retries => retries > 5 ? new Error('Redis connection failed') : Math.min(500 * retries, 3000) } });
  redis.on('error', () => console.error('Redis unavailable; protected requests fail closed.'));
  await redis.connect(); rate = new RedisRateStore(redis as RedisClientType);
  stopRedis = async () => { await redis.quit(); };
} else if (config.NODE_ENV !== 'production' && (config.DEVELOPMENT_EPHEMERAL || config.DEVELOPMENT_MEMORY_RATE_LIMITS)) {
  rate = new DevelopmentRateStore();
  console.warn('DEVELOPMENT RATE LIMITS: API request counters reset on restart. Business quota history is stored in the configured MongoDB database.');
}
else throw new Error('REDIS_URL is required for centralized API rate limits.');
const app = createApp(config, rate, mailer(config));
const server = app.listen(config.PORT, config.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1', () => console.info(`TrackLab API listening on port ${config.PORT}`));
server.requestTimeout = 15000; server.headersTimeout = 20000;
let stopping = false;
async function shutdown() { if (stopping) return; stopping = true; const deadline = setTimeout(() => process.exit(1), 10000).unref(); await new Promise<void>(resolve => server.close(() => resolve())); await mongoose.disconnect(); await stopRedis?.(); await stopDatabase?.(); clearTimeout(deadline); }
process.on('SIGTERM', () => { void shutdown(); }); process.on('SIGINT', () => { void shutdown(); });
