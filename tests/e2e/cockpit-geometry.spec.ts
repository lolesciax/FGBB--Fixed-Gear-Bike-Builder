import { test, expect } from "@playwright/test";

test("cockpit type filters preserve the frame and synchronize all four bars across viewers", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByRole("combobox", { name: "02 LA variant", exact: true })
    .selectOption("dosnoventa-02-la-m");
  await expect(page.locator('.bike-svg')).toHaveAttribute('data-frame-variant','dosnoventa-02-la-m');
  await page.getByRole("button", { name: "Cockpit", exact: true }).click();
  await expect(page.getByLabel("Filter by brand")).toHaveValue("");
  const shapes = [
    ["flat", "Straight / flat bar", "studio-flat"],
    ["riser", "City riser", "studio-riser"],
    ["bullhorn", "City bullhorn", "studio-bullhorn"],
    ["drop", "Track drops", "studio-drop"],
  ];
  const before = (await (await page.request.get("/api/session")).json()).usage
    .changes;
  for (const [shape, label, variant] of shapes) {
    await page.getByLabel("Handlebar type").selectOption(shape);
    await expect(page.locator(".product-option")).toHaveCount(1);
    await page
      .getByRole("button", { name: `Select ${label}`, exact: true })
      .click();
    await expect(page.locator(".bike-svg")).toHaveAttribute(
      "data-cockpit-variant",
      variant,
    );
    await expect(page.locator(".bike-svg")).toHaveAttribute(
      "data-cockpit-shape",
      shape,
    );
    await page.getByRole("button", { name: "3D", exact: true }).click();
    const scene = page.locator(".bike3d-wrapper");
    await expect(scene).toHaveAttribute("data-loading", "false");
    await expect(scene).toHaveAttribute("data-cockpit-variant", variant);
    await expect(scene).toHaveAttribute("data-cockpit-shape", shape);
    await expect(scene).toHaveAttribute(
      "data-frame-variant",
      "dosnoventa-02-la-m",
    );
    await page.getByRole("button", { name: "2D", exact: true }).click();
  }
  const after = (await (await page.request.get("/api/session")).json()).usage
    .changes;
  expect(after - before).toBe(4);
  await page.getByRole("button", { name: "Undo last selection" }).click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-cockpit-variant",
    "studio-bullhorn",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Choose parts", exact: true }).click();
  const filter = page.getByLabel("Handlebar type");
  await filter.selectOption("flat");
  expect((await filter.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(
    page.getByRole("button", {
      name: "Select Straight / flat bar",
      exact: true,
    }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
