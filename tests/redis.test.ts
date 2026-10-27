import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, type RedisClientType } from 'redis';
import { RedisRateStore, randomToken } from '../apps/api/src/security';
const url = process.env.TEST_REDIS_URL;
describe.skipIf(!url)('live Redis distributed limiter', () => {
  let a: RedisClientType, b: RedisClientType;
  beforeAll(async () => { a = createClient({ url }) as RedisClientType; b = createClient({ url }) as RedisClientType; await Promise.all([a.connect(), b.connect()]); });
  afterAll(async () => { await Promise.all([a?.quit(), b?.quit()]); });
  it('uses one atomic rolling counter across independent clients', async () => { const key = `test:${randomToken()}`, one = new RedisRateStore(a), two = new RedisRateStore(b); const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => (i % 2 ? one : two).consume(key, 12, 60000))); expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(12); const denied = results.filter(r => r.status === 'rejected'); expect(denied).toHaveLength(8); for (const result of denied) if (result.status === 'rejected') expect(result.reason.code).toBe('RATE_LIMIT_EXCEEDED'); await a.del(`tracklab:rate:${key}`); });
});
