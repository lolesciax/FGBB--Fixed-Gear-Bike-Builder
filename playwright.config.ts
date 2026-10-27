import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1, timeout: 45000, expect: { timeout: 10000 },
  use: { baseURL: 'http://127.0.0.1:5190', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: { command: 'npm run dev:test', url: 'http://127.0.0.1:5190', reuseExistingServer: false, timeout: 180000 },
});
