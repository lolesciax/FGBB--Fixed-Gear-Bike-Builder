import { expect, it } from 'vitest';
import { makeTestEnvironment } from '../scripts/test-environment';
import { parseConfig } from '../apps/api/src/config';
it('replaces inherited external service credentials before any browser-test child process starts', () => {
  const inherited = { MONGODB_URI: 'mongodb+srv://atlas.example.test/other-app', MONGODB_DB_NAME: 'other-app', REDIS_URL: 'redis://shared.example.test', SMTP_HOST: 'smtp.example.test', SMTP_PASS: 'private-test-fixture', SESSION_SECRET: 'inherited-secret', VITE_API_URL: 'https://api.example.test', DOTENV_CONFIG_PATH: '.env' };
  const env = makeTestEnvironment(inherited);
  const config = parseConfig(env);
  expect(config.MONGODB_URI).toBeUndefined(); expect(config.REDIS_URL).toBeUndefined();
  expect(config.MONGODB_DB_NAME).toBe('tracklab_e2e'); expect(config.DEVELOPMENT_EPHEMERAL).toBe(true);
  expect(config.SMTP_HOST).toBe(''); expect(config.SMTP_PASS).toBe('');
  expect(config.SESSION_SECRET).not.toBe(inherited.SESSION_SECRET); expect(env.VITE_API_URL).toBe('');
  expect(env.DOTENV_CONFIG_PATH).not.toBe('.env'); expect(config.PORT).toBe(4010);
  expect(makeTestEnvironment({DEVELOPMENT_DISABLE_QUOTAS:'true'}).DEVELOPMENT_DISABLE_QUOTAS).toBe('false');
  expect(makeTestEnvironment({TRACKLAB_E2E_QUOTA_BYPASS:'true'}).DEVELOPMENT_DISABLE_QUOTAS).toBe('true');
});
