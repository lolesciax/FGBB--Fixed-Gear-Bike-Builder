import { test, expect } from '@playwright/test';
test('guest selection, undo, quota persistence and compatibility rejection', async ({ page }) => {
  await page.goto('/builder');
  const acid = page.getByRole('button', { name: 'Studio Track Acid finish' }); await expect(acid).toBeEnabled();
  await acid.click(); await expect(acid).toHaveAttribute('aria-pressed', 'true'); await expect(page.getByText('11 of 12 component changes left', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Undo last selection' }).click(); await expect(page.getByRole('button', { name: 'Studio Track Forest finish' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Tires', exact: true }).click(); await page.getByRole('button', { name: 'Select Road 28 · tan wall' }).click();
  await page.getByRole('button', { name: 'Frameset', exact: true }).click(); await page.getByRole('button', { name: 'Select Studio Pursuit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('conflicts with your current parts');
  await expect(page.getByRole('button', { name: 'Select Studio Track', exact: true })).toHaveAttribute('aria-pressed', 'true');
  page.once('dialog', d => d.accept()); await page.reload();
  await expect(page.getByText('9 of 12 component changes left', { exact: false })).toBeVisible();
});
test('3D authorization loads a real canvas and both views retain the finish', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/builder'); await page.getByRole('button', { name: 'Studio Track Acid finish' }).click();
  const grant = page.waitForResponse(r => r.url().includes('/workspace/preview') && r.request().method() === 'POST');
  await page.getByRole('button', { name: '3D', exact: true }).click(); expect((await grant).status()).toBe(200);
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(() => page.locator('canvas').evaluate(c => (c as HTMLCanvasElement).width)).toBeGreaterThan(0);
  await page.getByRole('button', { name: '2D', exact: true }).click(); await expect(page.getByRole('button', { name: 'Studio Track Acid finish' })).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});
test('register, save, edit existing build, then duplicate and delete in the garage', async ({ page }) => {
  await page.goto('/builder'); await page.getByRole('button', { name: 'Studio Track Acid finish' }).click();
  await page.getByRole('button', { name: 'Save build', exact: true }).click(); const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Your name').fill('Browser Rider'); await dialog.getByLabel('Email address').fill(`browser-${Date.now()}@example.com`); await dialog.getByLabel('Password', { exact: true }).fill('my-browser-test-passphrase'); await dialog.getByRole('button', { name: 'Create your account', exact: true }).click();
  await expect(dialog).not.toBeVisible(); await expect(page.getByRole('button', { name: 'Studio Track Acid finish' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('textbox', { name: 'Build name', exact: true }).fill('Morning ride'); await page.getByRole('button', { name: 'Save build', exact: true }).click(); await expect(page).toHaveURL(/\/builder\/[a-f0-9]{24}/);
  await expect(page.getByRole('button', { name: 'Studio Track Forest finish' })).toBeEnabled(); await page.getByRole('button', { name: 'Studio Track Forest finish' }).click(); await page.getByRole('button', { name: 'Save build', exact: true }).click();
  await page.getByRole('link', { name: 'My garage', exact: true }).click(); await expect(page.getByText('1 of 5 builds used')).toBeVisible(); await expect(page.getByRole('heading', { name: 'Morning ride', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Duplicate Morning ride', exact: true }).click(); await expect(page.getByText('2 of 5 builds used')).toBeVisible();
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete Morning ride (copy)', exact: true }).click(); await expect(page.getByText('1 of 5 builds used')).toBeVisible();
});
test('mobile workspace, account dialog and dark theme fit the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/builder');
  await expect(page.getByRole('button', { name: 'Studio Track Forest finish' })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle color theme' }).click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await expect.poll(() => page.getByRole('dialog').evaluate(d => d.getBoundingClientRect().width)).toBeLessThan(391);
  await page.getByRole('button', { name: 'Close sign in' }).click(); await expect(page.getByRole('dialog')).not.toBeVisible();
});
