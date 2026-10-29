import { test, expect, type Page } from "@playwright/test";
test("finite finishes and studio effects settle without remeshing; a single canvas and manual camera survive mode changes", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await expect(viewer).toHaveAttribute("data-camera-moving", "false");
  await page.getByLabel("Graphics quality").selectOption("balanced");
  const before = await sceneDetails(page);
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("polished");
  await expect
    .poll(async () => (await sceneDetails(page)).wheelPaint)
    .toBe("b9c2cd");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  const painted = await sceneDetails(page);
  expect(painted.geometries).toEqual(before.geometries);
  expect(painted.rubberPaint).toBe(before.rubberPaint);
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("pure-black");
  await expect
    .poll(async () => (await sceneDetails(page)).wheelPaint, {
      intervals: [20, 30],
    })
    .not.toBe("b9c2cd");
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("polished");
  await expect
    .poll(async () => (await sceneDetails(page)).wheelPaint)
    .toBe("b9c2cd");
  expect((await sceneDetails(page)).geometries).toEqual(before.geometries);
  await page.getByLabel("Studio environment").selectOption("dark");
  await expect
    .poll(async () => (await sceneDetails(page)).background)
    .toBe("151a22");
  expect((await sceneDetails(page)).environment).toBe(painted.environment);
  expect((await sceneDetails(page)).exposure).toBeCloseTo(1.12, 6);
  const inspectionColors = await page
    .getByRole("button", { name: "Inspect", exact: true })
    .evaluate((button) => ({
      foreground: getComputedStyle(button).color,
      appText: getComputedStyle(document.documentElement).color,
    }));
  expect(inspectionColors.foreground).toBe(inspectionColors.appText);
  const bounds = await page.locator("canvas").boundingBox();
  await page.mouse.move(bounds!.x + 50, bounds!.y + 70);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 100, bounds!.y + 95, { steps: 8 });
  await page.mouse.up();
  // Orbit damping is frame based; a fixed delay finishes at different poses on
  // hardware Chrome and the slower CI renderer. Observe the settled pose.
  let previous = (await sceneDetails(page)).camera,
    stableSamples = 0;
  await expect
    .poll(
      async () => {
        const current = (await sceneDetails(page)).camera;
        const distance = Math.hypot(
          ...current.map((v: number, i: number) => v - previous[i]),
        );
        previous = current;
        stableSamples = distance < 0.00001 ? stableSamples + 1 : 0;
        return stableSamples;
      },
      { timeout: 20000, intervals: [100] },
    )
    .toBeGreaterThanOrEqual(3);
  const camera = (await sceneDetails(page)).camera;
  await page.evaluate(() => {
    (
      window as unknown as { retainedCanvas: HTMLCanvasElement | null }
    ).retainedCanvas = document.querySelector("canvas");
  });
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect.poll(async () => (await sceneDetails(page)).loop).toBe("never");
  const idle = (await sceneDetails(page)).frame;
  await page.waitForTimeout(300);
  expect((await sceneDetails(page)).frame).toBe(idle);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await expect(viewer).toHaveAttribute("data-camera-moving", "false");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { retainedCanvas: HTMLCanvasElement | null })
          .retainedCanvas === document.querySelector("canvas"),
    ),
  ).toBe(true);
  const after = (await sceneDetails(page)).camera;
  expect(
    Math.hypot(...after.map((v: number, i: number) => v - camera[i])),
  ).toBeLessThan(0.002);
});
async function sceneDetails(page: Page) {
  return page.evaluate(async () => {
    const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name,
      { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      root = s.scene.getObjectByName("bicycle_assembly");
    let morphs = 0;
    const geometries: string[] = [];
    root.traverse(
      (n: {
        isMesh: boolean;
        geometry: { morphAttributes: { position?: unknown } };
      }) => {
        if (n.isMesh && n.geometry.morphAttributes.position) morphs++;
        if (n.isMesh)
          geometries.push((n.geometry as unknown as { uuid: string }).uuid);
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
      geometries,
      frame: s.gl.info.render.frame,
      loop: s.frameloop,
      environment: s.scene.environment?.uuid,
      background: s.scene.background.getHexString(),
      exposure: s.gl.toneMappingExposure,
      wheelPaint: root
        .getObjectByName("laced_spokes")
        .material.color.getHexString(),
      rubberPaint: root
        .getObjectByName("rubber_section")
        .material.color.getHexString(),
    };
  });
}
test("validated size morphs use temporary buffers and compatible geometry while construction and spoke changes replace", async ({
  page,
}) => {
  test.setTimeout(120000);
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
  test.setTimeout(120000);
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
test("network loss during a model load preserves the accepted 2D selection and retries the latest target", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  const targetUrl = "**/models/frames/dosnoventa-03-det-m.glb*";
  await page.route(targetUrl, async (route) => {
    await gate;
    await route.abort("internetdisconnected");
  });
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  const previous = await viewer.getAttribute("data-frame-variant");
  await page.getByLabel("Filter by brand").selectOption("Dosnoventa");
  await page
    .getByLabel("03 DET variant", { exact: true })
    .selectOption("dosnoventa-03-det-m");
  await expect(viewer).toHaveAttribute(
    "data-transition-phase",
    "loading-assets",
  );
  const usage = (await (await page.request.get("/api/session")).json()).usage;
  await context.setOffline(true);
  release();
  await expect(viewer).toHaveAttribute("data-transition-phase", "failed");
  await expect(viewer).toHaveAttribute("data-frame-variant", previous!);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toBeVisible();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-03-det-m",
  );
  await expect(page.locator("canvas")).toHaveCount(1);
  await context.setOffline(false);
  await page.unroute(targetUrl);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await page
    .getByRole("button", { name: "Retry 3D model", exact: true })
    .click();
  await expect(viewer).toHaveAttribute(
    "data-frame-variant",
    "dosnoventa-03-det-m",
  );
  await expect(viewer).toHaveAttribute("data-loading", "false");
  expect((await (await page.request.get("/api/session")).json()).usage).toEqual(
    usage,
  );
  expect((await sceneDetails(page)).groups).toBe(6);
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
