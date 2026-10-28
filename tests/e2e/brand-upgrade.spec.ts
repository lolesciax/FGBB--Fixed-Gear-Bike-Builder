import { test, expect } from "@playwright/test";
test("an unavailable frame kit keeps the configuration and supports an explicit retry", async ({
  page,
}) => {
  await page.route("**/models/frames/dosnoventa-02-la-m.glb", (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByRole("combobox", { name: "02 LA variant", exact: true })
    .selectOption("dosnoventa-02-la-m");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(
    page.getByText("3D preview unavailable", { exact: true }),
  ).toBeVisible();
  await page.unroute("**/models/frames/dosnoventa-02-la-m.glb");
  await page.getByRole("button", { name: "Retry 3D model" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-02-la-m",
  );
});
test("studio landing page and variant previews stay usable across phone and desktop", async ({
  page,
}) => {
  const assets: string[] = [];
  page.on("request", (request) => {
    if (/\.glb/.test(request.url())) assets.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build Beyond the Ordinary." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start building", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore framesets", exact: true }).first(),
  ).toBeVisible();
  for (const width of [320, 375, 430, 768, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 932 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  expect(assets).toEqual([]);
  if (process.env.TRACKLAB_VISUAL_QA) {
    await page.getByRole("button", { name: "Toggle color theme" }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: "output/playwright/home-studio-dark.png",
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: "output/playwright/home-studio-mobile.png",
      fullPage: true,
    });
  }
});
test("separate frame kits load on demand, camera presets work, and guest sessions expire", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByRole("combobox", { name: "02 LA variant", exact: true })
    .selectOption("dosnoventa-02-la-m");
  const first = page.waitForResponse((response) =>
    response.url().endsWith("dosnoventa-02-la-m.glb"),
  );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  expect((await first).status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible();
  const second = page.waitForResponse((response) =>
    response.url().endsWith("dosnoventa-03-det-m.glb"),
  );
  await page
    .getByRole("combobox", { name: "03 DET variant", exact: true })
    .selectOption("dosnoventa-03-det-m");
  expect((await second).status()).toBe(200);
  await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-03-det-m",
  );
  for (const view of ["front", "rear", "three-quarter", "side"]) {
    await page.getByLabel("Camera view").selectOption(view);
    await expect(page.getByLabel("Camera view")).toHaveValue(view);
  }
  if (process.env.TRACKLAB_VISUAL_QA)
    await page.screenshot({ path: "output/playwright/frameset-3d-det.png" });
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  expect(
    (await (await page.request.get("/api/session")).json()).usage.previews,
  ).toBe(1);
  await page.clock.fastForward(601000);
  await expect(page.locator("canvas")).not.toBeVisible();
  await expect(page.getByRole("alert")).toContainText("3D session ended");
  expect(errors).toEqual([]);
});
