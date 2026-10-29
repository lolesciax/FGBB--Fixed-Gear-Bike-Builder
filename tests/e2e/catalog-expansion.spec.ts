import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("brand/model research is separate from selectable variants and remains responsive", async ({
  page,
}) => {
  await page.goto("/catalog");
  await page.getByLabel("Catalog manufacturer").selectOption("Skream");
  await expect(page.locator(".catalog-card")).toHaveCount(2);
  await page.getByText("Brand and model support", { exact: true }).click();
  await page.getByLabel("Research manufacturer").selectOption("tsunami");
  await expect(page.locator(".model-record")).toHaveCount(3);
  await expect(
    page.locator(".model-record").filter({
      has: page.getByRole("heading", { name: "SNM200", exact: true }),
    }),
  ).toContainText("Visualization unavailable");
  await page.getByLabel("Research manufacturer").selectOption("skream");
  await expect(page.locator(".model-record")).toHaveCount(2);
  await expect(page.locator(".model-record").first()).toContainText(
    "2D Supported / 3D Supported",
  );
  for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  if (process.env.TRACKLAB_VISUAL_QA) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: "output/playwright/expanded-catalog.png",
      fullPage: true,
    });
  }
});
test("dependent frame changes preserve state, geometry, usage and undo across the two viewers", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  await page.getByRole("button", { name: "Tires", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Road 28 · tan wall", exact: true })
    .click();
  await page.getByRole("button", { name: "Frameset", exact: true }).click();
  await page
    .getByLabel("Studio Pursuit variant", { exact: true })
    .selectOption("studio-pursuit-graphite");
  const dialog = page.getByRole("dialog", { name: "Review dependent parts" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Apply 1 changes", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Cancel frame change", exact: true })
    .click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "studio-track-graphite",
  );
  await page
    .getByLabel("Studio Pursuit variant", { exact: true })
    .selectOption("studio-pursuit-graphite");
  await dialog
    .getByLabel("Replacement tires", { exact: true })
    .selectOption("studio-tire25");
  await dialog
    .getByRole("button", { name: "Apply 2 changes", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".quota-menu summary")).toContainText(
    "21 changes remaining",
  );
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "studio-track-graphite",
  );
  await page
    .getByRole("button", { name: "Redo selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "studio-pursuit-graphite",
  );
  await page.getByLabel("Filter by brand").selectOption("Skream");
  await page
    .getByLabel("Magnum variant", { exact: true })
    .selectOption("skream-magnum-m");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "skream-magnum-m",
  );
  const before = await page.locator(".bike-svg").getAttribute("viewBox"),
    asset = page.waitForResponse((r) =>
      r.url().split("?")[0].endsWith("/models/frames/skream-magnum-m.glb"),
    );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  expect((await asset).status()).toBe(200);
  await expect(page.locator("canvas")).toBeVisible();
  const rangerAsset = page.waitForResponse((r) =>
    r.url().split("?")[0].endsWith("/models/frames/skream-ranger-m.glb"),
  );
  await page
    .getByLabel("Ranger variant", { exact: true })
    .selectOption("skream-ranger-m");
  expect((await rangerAsset).status()).toBe(200);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  expect(await page.locator(".bike-svg").getAttribute("viewBox")).not.toBe(
    before,
  );
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "skream-magnum-m",
  );
  for (const [brand, model, id] of [
    ["State Bicycle Co.", "6061 Black Label v3", "state-black-label-v3-55"],
    ["8bar", "KRZBERG V8", "8bar-krzberg-v8-m"],
    ["Wabi Cycles", "Prism", "wabi-prism-54"],
  ]) {
    await page.getByLabel("Filter by brand").selectOption(brand);
    await page.getByLabel(model + " variant", { exact: true }).selectOption(id);
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(".bike-svg")).toHaveAttribute(
      "data-frame-variant",
      id,
    );
  }
  expect(errors).toEqual([]);
});

test("an isolated admin can maintain manufacturers and review permitted uploads without publishing them", async ({
  page,
}) => {
  const credentials = JSON.parse(
    await readFile(".local/e2e-admin.json", "utf8"),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const signIn = page.getByRole("dialog");
  await signIn.getByLabel("Email address").fill(credentials.email);
  await signIn
    .getByLabel("Password", { exact: true })
    .fill(credentials.password);
  await signIn.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(signIn).not.toBeVisible();
  await page.goto("/admin");
  await page
    .getByText("Manufacturers and model research", { exact: true })
    .click();
  await page
    .getByLabel("Manufacturer id", { exact: true })
    .fill("browser-review-brand");
  await page
    .getByLabel("Manufacturer name", { exact: true })
    .fill("Browser Review Brand");
  await page
    .getByLabel("Manufacturer source", { exact: true })
    .fill("https://example.com/");
  await page
    .getByLabel("Manufacturer description", { exact: true })
    .fill("Isolated research fixture.");
  await page
    .getByRole("button", { name: "Save manufacturer", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Registry record saved" }),
  ).toBeVisible();
  await page.getByText("Permitted asset review inbox", { exact: true }).click();
  await page.getByLabel("Catalog product ID").fill("skream-magnum");
  await page
    .getByLabel("Asset file")
    .setInputFiles("frontend/public/models/frames/skream-magnum-m.glb");
  await page
    .getByLabel("License or permission")
    .fill("Original TrackLab CC0 geometry");
  await page
    .getByLabel("Rights evidence URL")
    .fill("https://example.com/test-permission");
  await page.getByLabel("I have confirmed permission").check();
  await page.getByRole("button", { name: "Upload for review" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Uploaded to the private review inbox" }),
  ).toBeVisible();
  await expect(
    page.getByText(/skream-magnum \/ skream-magnum-m.glb/),
  ).toContainText("pending");
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
