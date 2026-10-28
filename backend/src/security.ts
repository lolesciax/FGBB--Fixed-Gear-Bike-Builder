import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { RedisClientType } from 'redis';
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown, public retryAfterSeconds?: number) { super(message); }
}
export const randomToken = () => randomBytes(32).toString('base64url');
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export const privateKey = (s: string, secret: string) => createHmac('sha256', secret).update(s).digest('hex');
export function sign(payload: unknown, secret: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${privateKey(data, secret)}`;
}
export function unsign<T>(signed: string, secret: string): T {
  const [data, signature, extra] = signed.split('.');
  const expected = privateKey(data || '', secret);
  if (extra || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new ApiError(400, 'INVALID_WORKSPACE', 'Your workspace token is invalid. Reopen the builder.');
  try { return JSON.parse(Buffer.from(data, 'base64url').toString()) as T; } catch { throw new ApiError(400, 'INVALID_WORKSPACE', 'Invalid workspace token.'); }
}
export interface RateStore { consume(key: string, limit: number, windowMs: number): Promise<void> }
const lua = `local now=tonumber(ARGV[1]); local window=tonumber(ARGV[2]); local limit=tonumber(ARGV[3]); redis.call('ZREMRANGEBYSCORE',KEYS[1],'-inf',now-window); local n=redis.call('ZCARD',KEYS[1]); if n>=limit then local oldest=redis.call('ZRANGE',KEYS[1],0,0,'WITHSCORES'); return math.max(1,math.ceil((tonumber(oldest[2])+window-now)/1000)); end; redis.call('ZADD',KEYS[1],now,ARGV[4]); redis.call('PEXPIRE',KEYS[1],window); return 0;`;
export class RedisRateStore implements RateStore {
  constructor(private redis: RedisClientType) {}
  async consume(key: string, limit: number, windowMs: number) {
    const retry = Number(await this.redis.eval(lua, { keys: [`tracklab:rate:${key}`], arguments: [String(Date.now()), String(windowMs), String(limit), randomToken()] }));
    if (retry) throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'You have reached the allowed number of requests.', undefined, retry);
  }
}
/** Explicitly restricted to tests and opt-in ephemeral development. Never used in production. */
export class DevelopmentRateStore implements RateStore {
  private counters = new Map<string, number[]>();
  async consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    if (this.counters.size > 10000) for (const [k, v] of this.counters) if (!v.length || v.at(-1)! < now - 3600000) this.counters.delete(k);
    const events = (this.counters.get(key) ?? []).filter(t => t > now - windowMs);
    if (events.length >= limit) throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'You have reached the allowed number of requests.', undefined, Math.max(1, Math.ceil((events[0] + windowMs - now) / 1000)));
    events.push(now); this.counters.set(key, events);
  }
}
