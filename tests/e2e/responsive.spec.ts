import { test, expect } from '@playwright/test';

test('builder adapts across the required widths, themes and landscape', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/builder');
  await expect(page.getByRole('button', { name: 'Studio Track Graphite finish' })).toBeEnabled();
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme)
      await page.getByRole('button', { name: 'Toggle color theme' }).click();
    for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 932 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('img', { name: /Illustrative fixed-gear bicycle/ })).toBeVisible();
      if (width <= 1100) {
        const trigger = page.getByRole('button', { name: 'Choose parts', exact: true });
        await trigger.click();
        const sheet = page.getByRole('dialog');
        await expect(sheet).toBeVisible();
        const box = await sheet.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
        await sheet.getByLabel('Component category').selectOption('wheels');
        await expect(sheet.getByRole('button', { name: 'Select Deep section', exact: true })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(sheet).not.toBeVisible();
        await expect(trigger).toBeFocused();
      }
    }
    await page.setViewportSize({ width: 844, height: 390 });
    await page.getByRole('button', { name: 'Choose parts', exact: true }).click();
    const sheet = page.getByRole('dialog');
    const box = await sheet.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(391);
    await sheet.getByRole('button', { name: 'Done', exact: true }).click();
  }
  if (process.env.TRACKLAB_VISUAL_QA) {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.getByRole('button', { name: 'Frameset', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'output/playwright/builder-desktop-dark.png' });
    await page.getByRole('button', { name: 'Toggle color theme' }).click();
    await page.setViewportSize({ width: 430, height: 932 });
    await page.getByRole('button', { name: 'Choose parts', exact: true }).click();
    await page.screenshot({ path: 'output/playwright/builder-mobile-light.png' });
  }
});

test('semantic text colors meet AA contrast in both themes and theme persists', async ({ page }) => {
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme)
      await page.getByRole('button', { name: 'Toggle color theme' }).click();
    const ratios = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      const luminance = (token: string) => {
        const hex = css.getPropertyValue(token).trim().slice(1);
        const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      return [['--ink', '--surface'], ['--muted', '--surface'], ['--muted', '--bg'], ['--primary', '--surface'], ['--on-primary', '--primary']].map(([a, b]) => {
        const x = luminance(a), y = luminance(b);
        return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
      });
    });
    for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  }
});
