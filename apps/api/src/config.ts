import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_URL: z.url().default('http://127.0.0.1:5180'),
  MONGODB_URI: z.preprocess(v => v === '' ? undefined : v, z.string().trim().regex(/^mongodb(?:\+srv)?:\/\//, 'Use a MongoDB or MongoDB Atlas connection URI.').optional()),
  MONGODB_DB_NAME: z.string().regex(/^[a-zA-Z0-9_-]{1,63}$/).optional(),
  REDIS_URL: z.preprocess(v => v === '' ? undefined : v, z.string().min(1).optional()),
  SESSION_SECRET: z.string().min(43).optional(), COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
  DEVELOPMENT_EPHEMERAL: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
  DEVELOPMENT_MEMORY_RATE_LIMITS: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
  GUEST_CHANGES: z.coerce.number().int().min(1).max(12).default(12), GUEST_PREVIEWS: z.coerce.number().int().min(1).max(1).default(1),
  BUILD_LIMIT: z.coerce.number().int().min(1).max(5).default(5), CREATE_DAILY_LIMIT: z.coerce.number().int().min(1).max(3).default(3), CREATE_MONTHLY_LIMIT: z.coerce.number().int().min(1).max(20).default(20),
  PUBLISH_LIMIT: z.coerce.number().int().min(1).max(3).default(3), EXPORT_DAILY_LIMIT: z.coerce.number().int().min(1).max(5).default(5),
  CATALOG_GUEST_RPM: z.coerce.number().int().positive().max(600).default(60), CATALOG_USER_RPM: z.coerce.number().int().positive().max(1200).default(120), GENERAL_RPM: z.coerce.number().int().positive().max(1200).default(120), SAVE_HOURLY_LIMIT: z.coerce.number().int().positive().max(30).default(30),
  PRICING_ENABLED: z.literal('false').default('false'),
  SMTP_HOST: z.string().optional(), SMTP_PORT: z.coerce.number().default(587), SMTP_USER: z.string().optional(), SMTP_PASS: z.string().optional(), EMAIL_FROM: z.string().default('TrackLab <noreply@example.com>'),
  ASSET_CDN_URL: z.string().default(''), LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
});
export function parseConfig(env: Record<string, string | undefined>) {
  const c = schema.parse(env);
  if (c.NODE_ENV === 'production' && (c.DEVELOPMENT_EPHEMERAL || c.DEVELOPMENT_MEMORY_RATE_LIMITS || !c.MONGODB_URI || !c.REDIS_URL || !c.SESSION_SECRET || !c.SMTP_HOST || !c.FRONTEND_URL.startsWith('https://'))) throw new Error('Production requires MongoDB, Redis, a random 43+ character session secret, SMTP, HTTPS frontend and both development fallback flags disabled.');
  return { ...c, SESSION_SECRET: c.SESSION_SECRET ?? 'development-only-secret-never-use-this-value-in-production-000' };
}
export type Config = ReturnType<typeof parseConfig>;
