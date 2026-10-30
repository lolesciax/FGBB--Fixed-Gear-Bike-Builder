import { test, expect } from "@playwright/test";

test("structural closeups and optional diagnostics inspect the current assembly without changing it", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await page.getByText("Development geometry tools", { exact: true }).click();
  await page.getByLabel("Mesh intersections", { exact: true }).check();
  await expect(page.locator("[data-geometry-report]")).toContainText(
    "14 mesh pairs checked",
  );
  await expect(page.locator("[data-geometry-report]")).toContainText(
    "0 intersections or alignment errors",
  );
  for (const target of [
    "dev-head",
    "dev-headset",
    "dev-crown",
    "dev-front-dropout",
    "dev-rear-dropout",
    "dev-front-hardware",
    "dev-rear-hardware",
    "dev-stays",
    "dev-bb",
  ]) {
    await page.getByLabel("Structural close-up").selectOption(target);
    await expect(viewer).toHaveAttribute("data-camera-moving", "false");
    await expect(viewer).toHaveAttribute(
      "data-frame-variant",
      "cinelli-vigorelli-80s-national-blu-m-v1",
    );
  }
  for (const label of ["Anchors and axes", "Mesh bounds"])
    await page.getByLabel(label, { exact: true }).check();
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const url = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name,
          { _roots } = await import(url),
          s = _roots.get(document.querySelector("canvas")).store.getState();
        const overlay = s.scene.getObjectByName("development_geometry_overlay");
        return overlay?.children.length || 0;
      }),
    )
    .toBeGreaterThan(30);
  for (const label of ["Anchors and axes", "Mesh bounds", "Mesh intersections"])
    await page.getByLabel(label, { exact: true }).uncheck();
  await expect(page.locator("[data-geometry-report]")).toHaveCount(0);
  await page.getByLabel("Structural close-up").selectOption("");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  const svg = page.locator(".bike-svg");
  await expect(svg).toBeVisible();
  await expect(svg).toHaveAttribute(
    "data-frame-variant",
    "cinelli-vigorelli-80s-national-blu-m-v1",
  );
  await expect(svg.locator("[data-axle-washer]")).toHaveCount(2);
  await expect(svg.locator("[data-axle-nut]")).toHaveCount(2);
  expect(
    await svg.evaluate((node) => {
      const far = node.querySelector('[data-layer="far-frame-fork"]')!,
        wheels = node.querySelector('[data-finish-zone="wheelset"]')!,
        near = node.querySelector('[data-layer="paint-regions"]')!,
        hardware = node.querySelector('[data-layer="outer-axle-hardware"]')!;
      const before = (a: Element, b: Element) =>
        !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return (
        before(far, wheels) && before(wheels, near) && before(near, hardware)
      );
    }),
  ).toBe(true);
  expect(errors).toEqual([]);
});
