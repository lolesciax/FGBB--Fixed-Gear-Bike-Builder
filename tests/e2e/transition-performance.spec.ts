import { test, expect, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
async function stats(page: Page) {
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
      memory: { ...s.gl.info.memory },
      programs: s.gl.info.programs.length,
      frame: s.gl.info.render.frame,
      render: { ...s.gl.info.render },
      morphs,
      groups: root.children.length,
      heap: (
        performance as Performance & { memory?: { usedJSHeapSize: number } }
      ).memory?.usedJSHeapSize,
    };
  });
}
test("repeated frame changes reuse downloads, release morph buffers and return to demand-rendered idle", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes(".glb")) requests.push(r.url());
  });
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  const loadStart = Date.now();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  const sceneLoadMs = Date.now() - loadStart;
  await page.getByLabel("Graphics quality").selectOption("balanced");
  const profiler = await page.context().newCDPSession(page);
  const samples = [];
  const selectionToSettledMs: number[] = [];
  let warmRequests = 0;
  for (let cycle = 0; cycle < 4; cycle++) {
    for (const size of ["xl", "m"]) {
      const start = Date.now();
      await page
        .getByLabel("Vigorelli variant", { exact: true })
        .selectOption("cinelli-vigorelli-80s-national-blu-" + size + "-v1");
      await expect(viewer).toHaveAttribute(
        "data-frame-variant",
        "cinelli-vigorelli-80s-national-blu-" + size + "-v1",
      );
      await expect(viewer).toHaveAttribute("data-loading", "false");
      await expect(viewer).toHaveAttribute("data-camera-moving", "false");
      selectionToSettledMs.push(Date.now() - start);
    }
    // Compare retained memory after collection; allocation before a browser GC is not a leak metric.
    await profiler.send("HeapProfiler.collectGarbage");
    samples.push(await stats(page));
    if (cycle === 0) warmRequests = requests.length;
  }
  expect(requests.length).toBe(warmRequests);
  await profiler.detach();
  for (const sample of samples) {
    expect(sample.morphs).toBe(0);
    expect(sample.groups).toBe(6);
    expect(sample.memory.textures).toBe(samples[0].memory.textures);
    expect(sample.memory.geometries).toBeLessThanOrEqual(
      samples[0].memory.geometries + 2,
    );
    expect(sample.programs).toBeLessThanOrEqual(samples[0].programs + 2);
    if (sample.heap && samples[0].heap)
      expect(sample.heap).toBeLessThan(samples[0].heap * 1.2 + 2_000_000);
  }
  await page.evaluate(async () => {
    const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name,
      { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      original = s.gl.render;
    const times: number[] = [];
    s.gl.render = function (scene: unknown, camera: unknown) {
      if (scene === s.scene && camera === s.camera)
        times.push(performance.now());
      return original.call(this, scene, camera);
    };
    (window as unknown as { motionSample: unknown }).motionSample = {
      s,
      original,
      times,
    };
  });
  await page.getByLabel("Camera view").selectOption("rear-quarter");
  await expect(viewer).toHaveAttribute("data-camera-moving", "false");
  const timing = await page.evaluate(() => {
    const { s, original, times } = (
      window as unknown as {
        motionSample: {
          s: { gl: { render: unknown } };
          original: unknown;
          times: number[];
        };
      }
    ).motionSample;
    s.gl.render = original;
    const intervals = times
        .slice(1)
        .map((t, i) => t - times[i])
        .filter((t) => t > 0)
        .sort((a, b) => a - b),
      mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return {
      frames: times.length,
      meanMs: mean,
      p95Ms: intervals[Math.floor(intervals.length * 0.95)],
      observedFps: 1000 / mean,
    };
  });
  expect(timing.frames).toBeGreaterThan(5);
  await page.waitForTimeout(150);
  const idleStart = await stats(page);
  await page.waitForTimeout(350);
  const idleEnd = await stats(page);
  expect(idleEnd.frame - idleStart.frame).toBeLessThanOrEqual(1);
  await writeFile(
    testInfo.outputPath("motion-performance.json"),
    JSON.stringify(
      {
        samples,
        timing,
        idleFrames: idleEnd.frame - idleStart.frame,
        glbRequests: requests.length,
        sceneLoadMs,
        selectionToSettledMs,
      },
      null,
      2,
    ),
  );
});
test("mobile inspection, reduced motion and touch controls retain the selected build", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  await expect(viewer).toHaveAttribute("data-quality", "performance");
  await expect(
    page.getByRole("button", { name: "Toggle turntable" }),
  ).toBeDisabled();
  const before = (await (await page.request.get("/api/session")).json()).usage;
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Inspect assembly").selectOption("fork");
  await expect(page.getByLabel("Camera view")).toHaveValue("inspection");
  expect(
    (await sheet.getByLabel("Inspect assembly").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(44);
  await sheet.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Inspect", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect(page.getByLabel("Camera view")).toHaveValue("studio");
  expect((await (await page.request.get("/api/session")).json()).usage).toEqual(
    before,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-loading", "false");
  expect((await stats(page)).morphs).toBe(0);
});
