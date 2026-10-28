import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Browser tests must never inherit Atlas, Redis, SMTP or frontend API credentials. */
export function makeTestEnvironment(source: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return {
    ...source,
    NODE_ENV: 'test', PORT: '4010', FRONTEND_URL: 'http://127.0.0.1:5190',
    MONGODB_URI: '', MONGODB_DB_NAME: 'tracklab_e2e', REDIS_URL: '',
    DEVELOPMENT_EPHEMERAL: 'true', DEVELOPMENT_MEMORY_RATE_LIMITS: 'true',
    DEVELOPMENT_DISABLE_QUOTAS: source.TRACKLAB_E2E_QUOTA_BYPASS==='true'?'true':'false',
    SESSION_SECRET: randomBytes(48).toString('base64url'),
    SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '', EMAIL_FROM: 'TrackLab test <noreply@example.test>',
    PRICING_ENABLED: 'false', TRUST_PROXY_HOPS: '0', COOKIE_SAME_SITE: 'lax',
    TRACKLAB_WEB_PORT: '5190', TRACKLAB_API_PROXY: 'http://127.0.0.1:4010', VITE_API_URL: '',
    DOTENV_CONFIG_PATH: fileURLToPath(new URL('../.local/e2e-no-env', import.meta.url)),
  };
}
