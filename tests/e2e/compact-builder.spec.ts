import { test, expect } from "@playwright/test";

test("compact workspace fits the complete bicycle and keeps details out of the canvas layout", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/catalog");
  await page.getByRole("textbox", { name: "Search catalog" }).fill("Vigorelli");
  await expect(page.locator(".catalog-card .demo-tag")).toHaveText(
    "Source-reviewed / illustrative preview",
  );
  await page.getByRole("link", { name: "Builder", exact: true }).click();
  await expect(page.locator(".bike-svg")).toBeVisible();
  for (const theme of ["light", "dark"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page.getByRole("button", { name: "Toggle color theme" }).click();
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [1366, 768],
      [1024, 768],
      [768, 1024],
      [430, 932],
      [375, 812],
      [320, 568],
    ]) {
      await page.setViewportSize({ width, height });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        )
        .toBe(true);
      const framing = await page.locator(".bike-svg").evaluate((element) => {
        const svg = element as SVGSVGElement,
          group = svg.querySelector(":scope > g") as SVGGElement;
        const bounds = group.getBBox(),
          matrix = group.getScreenCTM()!;
        const a = new DOMPoint(bounds.x, bounds.y).matrixTransform(matrix),
          b = new DOMPoint(
            bounds.x + bounds.width,
            bounds.y + bounds.height,
          ).matrixTransform(matrix);
        const viewer = svg.closest(".viewer")!.getBoundingClientRect();
        return {
          left: a.x - viewer.left,
          top: a.y - viewer.top,
          right: viewer.right - b.x,
          bottom: viewer.bottom - b.y,
          width: (b.x - a.x) / viewer.width,
          height: (b.y - a.y) / viewer.height,
        };
      });
      expect(framing.left).toBeGreaterThanOrEqual(0);
      expect(framing.top).toBeGreaterThanOrEqual(0);
      expect(framing.right).toBeGreaterThanOrEqual(0);
      expect(framing.bottom).toBeGreaterThanOrEqual(0);
      expect(framing.width).toBeGreaterThan(width >= 1280 ? 0.64 : 0.6);
      expect(framing.height).toBeGreaterThan(0.5);
      if (width >= 1280) {
        expect(
          (await page.locator(".compact-summary").boundingBox())!.height,
        ).toBeLessThanOrEqual(80);
        const before = await page.locator(".viewer").boundingBox();
        await page
          .getByRole("button", { name: "View details", exact: true })
          .click();
        await expect(
          page.getByRole("dialog").getByText("Known weight:", { exact: false }),
        ).toBeVisible();
        expect(await page.locator(".viewer").boundingBox()).toEqual(before);
        await page.getByRole("button", { name: "Back to the build" }).click();
      }
      if (process.env.TRACKLAB_VISUAL_QA)
        await page.screenshot({
          path: `output/playwright/compact-${theme}-${width}x${height}.png`,
        });
    }
  }
});

test("source-reviewed Cinelli and Dosnoventa variants update geometry and survive view changes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  const svg = page.locator(".bike-svg");
  await expect(svg).toBeVisible();
  const initialGeometry = await svg.getAttribute("viewBox");
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await expect(
    page.getByRole("button", { name: "Select Vigorelli", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Vigorelli variant", exact: true })
    .selectOption("cinelli-vigorelli-rainbow-m");
  await expect(svg).toHaveAttribute(
    "data-frame-variant",
    "cinelli-vigorelli-rainbow-m",
  );
  expect(await svg.getAttribute("viewBox")).not.toBe(initialGeometry);
  await expect(page.locator(".viewer-label")).toContainText(
    "authentic assets unavailable",
  );
  await page.getByRole("button", { name: "View details", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("rail type, dimensions and clamp support need verification");
  await page.getByRole("button", { name: "Back to the build" }).click();
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  for (const [model, id] of [
    ["02 LA", "dosnoventa-02-la-m"],
    ["03 DET", "dosnoventa-03-det-m"],
    ["01 BCN", "dosnoventa-01-bcn-m"],
  ]) {
    await page
      .getByRole("combobox", { name: `${model} variant`, exact: true })
      .selectOption(id);
    await expect(svg).toHaveAttribute("data-frame-variant", id);
  }
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Fit bicycle to view" }).click();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(svg).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-01-bcn-m",
  );
  await page.getByRole("button", { name: "Full-screen preview" }).click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await page
    .getByRole("button", { name: "Create account to save", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Make room for your next ride." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
