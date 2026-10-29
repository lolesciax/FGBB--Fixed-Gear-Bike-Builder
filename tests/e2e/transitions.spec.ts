import { test, expect, type Page } from "@playwright/test";
async function sceneDetails(page: Page) {
  return page.evaluate(async () => {
    const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name,
      { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      root = s.scene.getObjectByName("bicycle_assembly");
    let morphs = 0;
    root.traverse(
      (n: {
        isMesh: boolean;
        geometry: { morphAttributes: { position?: unknown } };
      }) => {
        if (n.isMesh && n.geometry.morphAttributes.position) morphs++;
      },
    );
    return {
      ...root.userData,
      morphs,
      groups: root.children.length,
      camera: s.camera.position.toArray(),
      target: s.controls.target.toArray(),
      memory: { ...s.gl.info.memory },
      postCount: root.getObjectsByProperty("name", "seatpost").length,
      paddingVisible: root.getObjectByName("shaped_padding").visible,
    };
  });
}
test("validated size morphs use temporary buffers and compatible geometry while construction and spoke changes replace", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await page.getByLabel("Graphics quality").selectOption("balanced");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-xl-v1");
  await expect(viewer).toHaveAttribute("data-transition-strategy", "morph");
  await expect
    .poll(async () => (await sceneDetails(page)).morphs, {
      intervals: [30, 50, 100],
    })
    .toBeGreaterThan(0);
  await expect(viewer).toHaveAttribute("data-loading", "false");
  expect(await sceneDetails(page)).toMatchObject({
    morphs: 0,
    morphBuffers: 0,
    groups: 6,
    postCount: 1,
    paddingVisible: true,
  });
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  await page
    .getByRole("button", { name: "Skip animation", exact: true })
    .click();
  await expect(viewer).toHaveAttribute("data-transition-phase", "cancelled");
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "cinelli-vigorelli-80s-national-blu-m-v1",
  );
  expect(await sceneDetails(page)).toMatchObject({
    morphs: 0,
    morphBuffers: 0,
    groups: 6,
  });
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByLabel("03 DET variant", { exact: true })
    .selectOption("dosnoventa-03-det-m");
  await expect(viewer).toHaveAttribute(
    "data-transition-strategy",
    "replacement",
  );
  await expect(viewer).toHaveAttribute("data-loading", "false");
  expect(await sceneDetails(page)).toMatchObject({ morphs: 0, groups: 6 });
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Deep section", exact: true })
    .click();
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await page
    .getByLabel("Spoke configuration")
    .selectOption("studio-deep-36-36");
  await expect(viewer).toHaveAttribute(
    "data-transition-strategy",
    "replacement",
  );
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(72);
});
test("obsolete loads cannot replace the latest selection and a failed target retains the previous scene", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(
    "**/models/frames/dosnoventa-03-det-m.glb*",
    async (route) => {
      await gate;
      await route.continue().catch(() => {});
    },
  );
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByLabel("02 LA variant", { exact: true })
    .selectOption("dosnoventa-02-la-m");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await page
    .getByLabel("03 DET variant", { exact: true })
    .selectOption("dosnoventa-03-det-m");
  await expect(viewer).toHaveAttribute(
    "data-transition-phase",
    "loading-assets",
  );
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-02-la-m",
  );
  await page.getByLabel("Filter by brand").selectOption("Skream");
  await page
    .getByLabel("Ranger variant", { exact: true })
    .selectOption("skream-ranger-forest-m-v1");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  release();
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "skream-ranger-forest-m-v1",
  );
  await page.route(
    "**/models/frames/cinelli-vigorelli-rainbow-xl.glb*",
    (route) => route.fulfill({ status: 404, body: "" }),
  );
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-rainbow-xl");
  await expect(viewer).toHaveAttribute("data-transition-phase", "failed");
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "skream-ranger-forest-m-v1",
  );
  await expect(page.locator("canvas")).toHaveCount(1);
  expect((await sceneDetails(page)).groups).toBe(6);
  await page.unroute("**/models/frames/cinelli-vigorelli-rainbow-xl.glb*");
  await page
    .getByRole("button", { name: "Retry 3D model", exact: true })
    .click();
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "cinelli-vigorelli-rainbow-xl",
  );
  await expect(viewer).toHaveAttribute("data-loading", "false");
});
test("assembly inspection focuses actual parts, provides navigation and resets without charging a component change", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  const before = (await (await page.request.get("/api/session")).json()).usage,
    full = await sceneDetails(page);
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  await page.getByLabel("Inspect assembly").selectOption("saddle");
  const focused = await sceneDetails(page);
  expect(focused.target).not.toEqual(full.target);
  await expect(
    page.getByRole("region", { name: "Assembly inspection" }),
  ).toContainText("Needs verification");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  expect((await sceneDetails(page)).camera).not.toEqual(focused.camera);
  await page.getByRole("button", { name: "Pan left", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset assembly", exact: true })
    .click();
  expect((await sceneDetails(page)).target).toEqual(full.target);
  expect((await (await page.request.get("/api/session")).json()).usage).toEqual(
    before,
  );
});
