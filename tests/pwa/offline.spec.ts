import { expect, test } from '@playwright/test';

async function activateServiceWorker(page: import('@playwright/test').Page) {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
}
test('controlled online deep links remain online and fall back only when offline', async ({ page, context }) => {
  await page.goto('/builder'); await expect(page.getByRole('button', { name: 'Studio Track Forest finish' })).toBeEnabled();
  await activateServiceWorker(page);
  await page.reload(); await expect(page.getByRole('heading', { name: 'Bike Builder' })).toBeVisible();
  await page.goto('/catalog'); await expect(page.getByRole('heading', { name: 'The parts make the ride.' })).toBeVisible();
  await context.setOffline(true); await page.goto('/builder');
  await expect(page.getByRole('heading', { name: 'Your workshop is offline.' })).toBeVisible();
  await context.setOffline(false); await page.getByRole('link', { name: 'Reconnect to TrackLab' }).click();
  await expect(page.getByRole('heading', { name: 'Build Beyond the Ordinary.' })).toBeVisible();
});
test('installation does not fetch 3D assets or cache API/account responses', async ({ page, context }) => {
  const requests: string[] = [];
  context.on('request', request => requests.push(request.url()));
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'Build Beyond the Ordinary.' })).toBeVisible();
  await activateServiceWorker(page);
  const cached = await page.evaluate(async () => { const names = await caches.keys(); return (await Promise.all(names.map(async name => (await (await caches.open(name)).keys()).map(r => r.url)))).flat(); });
  expect(cached.some(url => /\/api\/|\.glb(?:\?|$)|\/assets\/.*\.js/.test(url))).toBe(false);
  expect(cached.some(url => url.includes('/offline.html'))).toBe(true);
  expect(requests.filter(url => /\.glb(?:\?|$)|\/assets\/Bike3D-/.test(url))).toEqual([]);
  await context.setOffline(true);
  const status = await page.evaluate(async () => { try { await fetch('/api/session'); return 'network-response'; } catch { return 'network-failed'; } });
  expect(status).toBe('network-failed');
});
