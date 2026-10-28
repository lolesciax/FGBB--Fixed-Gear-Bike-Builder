import { test, expect } from "@playwright/test";

test("studio settings, camera motion, turntable pause and canonical configuration", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const scene = page.locator(".bike3d-wrapper");
  await expect(scene).toHaveAttribute("data-loading", "false");
  const original = await scene.getAttribute("data-frame-variant");
  await page.getByLabel("Graphics quality").selectOption("balanced");
  await expect(scene).toHaveAttribute("data-quality", "balanced");
  await page.getByLabel("Studio environment").selectOption("dark");
  await expect(scene).toHaveAttribute("data-studio", "dark");
  for (const view of [
    "side",
    "front",
    "rear",
    "three-quarter",
    "rear-quarter",
    "top",
    "studio",
  ]) {
    await page.getByLabel("Camera view").selectOption(view);
    await expect(scene).toHaveAttribute("data-camera-moving", "true");
    await expect(scene).toHaveAttribute("data-camera-moving", "false");
  }
  const turntable = page.getByRole("button", { name: "Toggle turntable" });
  await turntable.click();
  await expect(turntable).toHaveAttribute("aria-pressed", "true");
  const bounds = await page.locator("canvas").boundingBox();
  await page.mouse.move(bounds!.x + 30, bounds!.y + 30);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 90, bounds!.y + 50, { steps: 5 });
  await page.mouse.up();
  await expect(turntable).toHaveAttribute("aria-pressed", "false");
  await turntable.click();
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await expect(turntable).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    original!,
  );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByLabel("Studio environment")).toHaveValue("dark");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(turntable).toBeDisabled();
  await page.getByLabel("Camera view").selectOption("rear");
  await expect(scene).toHaveAttribute("data-camera-moving", "false");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByLabel("Graphics quality").selectOption("auto");
  await expect(scene).toHaveAttribute("data-quality", "performance");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  for (const label of [
    "Camera view",
    "Studio environment",
    "Graphics quality",
  ]) {
    const box = await page.getByLabel(label).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("a pending model preserves the previous 3D assembly and reuses the downloaded kit", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/models/frames/dosnoventa-03-det-m.glb",
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByRole("combobox", { name: "02 LA variant", exact: true })
    .selectOption("dosnoventa-02-la-m");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const scene = page.locator(".bike3d-wrapper");
  await expect(scene).toHaveAttribute("data-loading", "false");
  await page
    .getByRole("combobox", { name: "03 DET variant", exact: true })
    .selectOption("dosnoventa-03-det-m");
  await expect(scene).toHaveAttribute("data-loading", "true");
  await expect(scene).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-02-la-m",
  );
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Previous preview remains visible" }),
  ).toBeVisible();
  release();
  await expect(scene).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-03-det-m",
  );
  let downloads = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("dosnoventa-02-la-m.glb")) downloads++;
  });
  await page
    .getByRole("combobox", { name: "02 LA variant", exact: true })
    .selectOption("dosnoventa-02-la-m");
  await expect(scene).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-02-la-m",
  );
  expect(downloads).toBe(0);
});
