import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/pwa', workers: 1, timeout: 45000, expect: { timeout: 10000 },
  use: { baseURL: 'http://127.0.0.1:5190', serviceWorkers: 'allow', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium-pwa', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }],
  webServer: { command: 'npm run preview:test', url: 'http://127.0.0.1:5190', reuseExistingServer: false, timeout: 180000 },
});
