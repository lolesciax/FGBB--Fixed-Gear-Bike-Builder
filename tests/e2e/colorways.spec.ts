import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { Colorway } from "@tracklab/domain";
async function sceneState(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
    const { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      geometries: string[] = [];
    s.scene
      .getObjectByName("bicycle_assembly")
      .traverse((n: { isMesh: boolean; geometry: { uuid: string } }) => {
        if (n.isMesh) geometries.push(n.geometry.uuid);
      });
    const down = s.scene.getObjectByName("paint_down");
    return {
      geometries,
      roughness: down.material.roughness,
      memory: { ...s.gl.info.memory },
      renderFrame: s.gl.info.render.frame,
    };
  });
}
test("model-specific colorways synchronize paint and fork without reloading size geometry", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByLabel("02 LA variant", { exact: true })
    .selectOption("dosnoventa-02-la-traffic-white-m-v1");
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-colorway-id",
    "dosnoventa-02-la-traffic-white-v1",
  );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const scene = page.locator(".bike3d-wrapper");
  await expect(scene).toHaveAttribute("data-loading", "false");
  const before = await sceneState(page);
  expect(before.roughness).toBeCloseTo(0.78, 2);
  let downloads = 0;
  page.on("request", (r) => {
    if (r.url().includes(".glb")) downloads++;
  });
  await page
    .getByRole("button", { name: "02 LA Jet Black colorway", exact: true })
    .click();
  await expect(scene).toHaveAttribute(
    "data-colorway-id",
    "dosnoventa-02-la-jet-black-v1",
  );
  const after = await sceneState(page);
  expect(after.geometries).toEqual(before.geometries);
  expect(after.roughness).toBeCloseTo(0.22, 2);
  expect(downloads).toBe(0);
  for (let cycle = 0; cycle < 3; cycle++)
    for (const name of ["Traffic White", "Jet Black"]) {
      await page
        .getByRole("button", { name: `02 LA ${name} colorway`, exact: true })
        .click();
      await expect(scene).toHaveAttribute(
        "data-colorway-id",
        `dosnoventa-02-la-${name === "Jet Black" ? "jet-black" : "traffic-white"}-v1`,
      );
    }
  const repeated = await sceneState(page);
  expect(repeated.geometries).toEqual(before.geometries);
  expect(repeated.memory.geometries).toBeLessThanOrEqual(
    after.memory.geometries,
  );
  expect(repeated.memory.textures).toBeLessThanOrEqual(after.memory.textures);
  await expect
    .poll(async () => {
      const first = await sceneState(page);
      await page.waitForTimeout(300);
      return (await sceneState(page)).renderFrame - first.renderFrame;
    })
    .toBe(0);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-colorway-id",
    "dosnoventa-02-la-jet-black-v1",
  );
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  for (const name of ["Rainbow", "Special White", "80s National Blu"]) {
    await page
      .getByRole("button", { name: `Vigorelli ${name} colorway`, exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: `Vigorelli ${name} colorway`,
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".product-option.selected")).toContainText(
      "Manufacturer graphics omitted",
    );
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("button", { name: "Choose parts", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Vigorelli Rainbow colorway",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("a two-tone size/colorway persists through save, reopen, garage and SVG export", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Skream");
  await page
    .getByLabel("Ranger variant", { exact: true })
    .selectOption("skream-ranger-forest-m-v1");
  const review = page.getByRole("dialog", { name: "Review dependent parts" });
  await review
    .getByLabel("Replacement seating", { exact: true })
    .selectOption("studio-race-316");
  await review
    .getByRole("button", { name: "Apply 2 changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ranger Sepia colorway", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Build name", exact: true })
    .fill("Sepia study");
  await page
    .getByRole("button", { name: "Create account to save", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your name").fill("Colorway Rider");
  await dialog
    .getByLabel("Email address")
    .fill(`finish-${Date.now()}@example.com`);
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("original-colorway-test-passphrase");
  await dialog
    .getByRole("button", { name: "Create your account", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\/[a-f0-9]{24}/);
  await page.reload();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-colorway-id",
    "skream-ranger-sepia-v1",
  );
  await page.getByRole("link", { name: "My garage", exact: true }).click();
  await expect(page.locator(".garage-card .bike-svg")).toHaveAttribute(
    "data-colorway-id",
    "skream-ranger-sepia-v1",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export image of Sepia study", exact: true })
    .click();
  const svg = await readFile((await (await download).path())!, "utf8");
  expect(svg).toContain("skream-ranger-sepia-v1");
  expect(svg).toContain("#b7a07b");
});
test("admin colorway review draws original permitted vector layers in SVG and on both 3D tube sides", async ({
  page,
}) => {
  test.setTimeout(90000);
  const credentials = JSON.parse(
    await readFile(".local/e2e-admin.json", "utf8"),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address").fill(credentials.email);
  await dialog
    .getByLabel("Password", { exact: true })
    .fill(credentials.password);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  const session = await (await page.request.get("/api/session")).json();
  const headers = {
    Origin: "http://127.0.0.1:5190",
    "X-CSRF-Token": session.csrf,
  };
  const catalog = await (await page.request.get("/api/admin/catalog")).json();
  const product = catalog.items.find(
      (r: { data: { id: string } }) => r.data.id === "studio-track",
    ).data,
    base = product.variants[0];
  const original = structuredClone(product);
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 20;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 10, 20);
    ctx.fillRect(10, 0, 20, 4);
    ctx.fillRect(10, 8, 14, 4);
    ctx.fillRect(70, 0, 130, 20);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const query = new URLSearchParams({
    productId: product.id,
    filename: "original-calibration.png",
    license: "CC0-1.0",
    evidence: "https://example.com/original-calibration",
    permission: "confirmed",
  });
  const uploaded = await page.request.post(
    "/api/admin/asset-reviews?" + query,
    {
      headers: { ...headers, "Content-Type": "image/png" },
      data: Buffer.from(png, "base64"),
    },
  );
  expect(uploaded.ok()).toBe(true);
  const review = await uploaded.json();
  const approval = await page.request.post(
    `/api/admin/asset-reviews/${review.id}/approve`,
    {
      headers,
      data: {
        permission: "confirmed",
        review:
          "Original CC0 calibration shapes created in this isolated test. No manufacturer artwork.",
      },
    },
  );
  expect(approval.ok()).toBe(true);
  const approved = await approval.json();
  const colorway: Colorway = {
    id: "studio-original-calibration-v1",
    revision: 1,
    productId: product.id,
    name: "Original calibration",
    modelRevision: "Independent test calibration v1",
    sizes: ["M"],
    status: "published",
    availability: "unknown",
    source: {
      url: "https://example.com/original-calibration",
      verifiedAt: new Date().toISOString(),
      references: [],
    },
    fidelity: "approximate",
    paint: {
      color: "#294f70",
      finish: "satin",
      roughness: 0.5,
      metalness: 0.2,
      clearcoat: 0.1,
      clearcoatRoughness: 0.3,
    },
    regions: [],
    graphics: [
      {
        id: "original-safe-vector",
        zone: "down",
        side: "both",
        from: 0.25,
        to: 0.65,
        width: 200,
        height: 20,
        license: "CC0-1.0",
        evidence: "https://example.com/original-calibration",
        permission: "confirmed",
        paths: [
          {
            d: "M0 0H40V4H8V8H34V12H8V20H0Z M70 0H200V20H70Z",
            fill: "#ffffff",
          },
        ],
      },
      {
        id: "original-safe-raster",
        zone: "top",
        side: "both",
        from: 0.25,
        to: 0.65,
        width: 200,
        height: 20,
        license: "CC0-1.0",
        evidence: "https://example.com/original-calibration",
        permission: "confirmed",
        raster: { reviewId: review.id, sha256: approved.sha256 },
      },
    ],
    missingGraphics: [],
    limitations:
      "Independent original calibration shapes; no manufacturer graphics or fidelity claim.",
    license: "original-paint-approximation",
  };
  product.colorways = [colorway];
  product.variants.push({
    ...base,
    id: "studio-original-calibration-m-v1",
    colorwayId: colorway.id,
    label: "M / Original calibration",
    color: colorway.paint.color,
    geometryVariantId: base.id,
    specs: { ...base.specs, size: "M" },
  });
  const update = await page.request.put("/api/admin/catalog/" + product.id, {
    headers,
    data: product,
  });
  expect(await update.text()).not.toContain("error");
  expect(update.ok()).toBe(true);
  try {
    await page.goto("/builder");
    await page
      .getByLabel("Studio Track variant", { exact: true })
      .selectOption("studio-original-calibration-m-v1");
    await expect(
      page.locator('.bike-svg [data-graphic-id="original-safe-vector"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: "3D", exact: true }).click();
    await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
      "data-loading",
      "false",
    );
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const url = performance
            .getEntriesByType("resource")
            .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
          const { _roots } = await import(url);
          const root = _roots
            .get(document.querySelector("canvas"))
            .store.getState()
            .scene.getObjectByName("permitted_finish_graphics");
          return root.children.length;
        }),
      )
      .toBe(4);
    await page.getByLabel("Camera view").selectOption("opposite-side");
    await page.route("**/api/colorway-assets/**", (route) =>
      route.fulfill({ status: 404, body: "Unavailable test graphic" }),
    );
    await page
      .getByLabel("Studio Track variant", { exact: true })
      .selectOption(base.id);
    await page
      .getByLabel("Studio Track variant", { exact: true })
      .selectOption("studio-original-calibration-m-v1");
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "A finish graphic could not load" }),
    ).toBeVisible();
    await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
      "data-colorway-id",
      colorway.id,
    );
    await page.goto("/admin");
    await page
      .getByLabel("Catalog record JSON")
      .fill(JSON.stringify(product, null, 2));
    await page
      .getByText("Colorway definitions and permissions", { exact: true })
      .click();
    await page.getByLabel("Edit colorway").selectOption(colorway.id);
    await expect(
      page.getByLabel("Official colorway source", { exact: true }),
    ).toHaveValue(colorway.source.url);
  } finally {
    const restored = await page.request.put(
      "/api/admin/catalog/" + product.id,
      { headers, data: original },
    );
    expect(restored.ok()).toBe(true);
  }
});
