import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 45000, expect: { timeout: 10000 },
  use: { baseURL: 'http://127.0.0.1:5180', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5180', reuseExistingServer: !process.env.CI, timeout: 180000, env: { DEVELOPMENT_EPHEMERAL: 'true', FRONTEND_URL: 'http://127.0.0.1:5180' } },
});
