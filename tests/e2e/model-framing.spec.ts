import { test, expect, type Page } from "@playwright/test";
import type * as THREE from "three";
async function projectedBounds(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
    const { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      root = s.scene.getObjectByName("bicycle_assembly");
    root.updateWorldMatrix(true, true);
    s.camera.updateMatrixWorld();
    const min = [Infinity, Infinity, Infinity],
      max = [-Infinity, -Infinity, -Infinity],
      p = s.camera.position.clone();
    let vertices = 0;
    root.traverse((node: THREE.Object3D) => {
      const mesh = node as THREE.Mesh,
        inst = node as THREE.InstancedMesh;
      if (!mesh.isMesh) return;
      const positions = mesh.geometry.getAttribute("position"),
        matrix = mesh.matrixWorld.clone(),
        instance = matrix.clone();
      if (!positions) return;
      for (let i = 0; i < (inst.isInstancedMesh ? inst.count : 1); i++) {
        matrix.copy(mesh.matrixWorld);
        if (inst.isInstancedMesh) {
          inst.getMatrixAt(i, instance);
          matrix.multiply(instance);
        }
        for (let j = 0; j < positions.count; j++) {
          p.fromBufferAttribute(positions, j)
            .applyMatrix4(matrix)
            .project(s.camera);
          const a = p.toArray();
          vertices++;
          for (let k = 0; k < 3; k++) {
            min[k] = Math.min(min[k], a[k]);
            max[k] = Math.max(max[k], a[k]);
          }
        }
      }
    });
    const rect = document.querySelector("canvas")!.getBoundingClientRect();
    return {
      min,
      max,
      vertices,
      bottom: rect.y + ((1 - min[1]) * rect.height) / 2,
      top: rect.y + ((1 - max[1]) * rect.height) / 2,
      camera: s.camera.position.toArray() as number[],
      target: s.controls.target.toArray() as number[],
      minDistance: s.controls.minDistance,
      maxDistance: s.controls.maxDistance,
    };
  });
}
test("actual vertices and instances fit source frames at every preset, phone, tablet and landscape aspect", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/builder");
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const scene = page.locator(".bike3d-wrapper");
  await expect(scene).toHaveAttribute("data-loading", "false");
  for (const [brand, label, ids] of [
    ["Dosnoventa", "02 LA", ["dosnoventa-02-la-s", "dosnoventa-02-la-l"]],
    [
      "Cinelli",
      "Vigorelli",
      ["cinelli-vigorelli-rainbow-xs", "cinelli-vigorelli-rainbow-xl"],
    ],
    ['Skream','Magnum',['skream-magnum-xs','skream-magnum-xl']],
    ['Skream','Ranger',['skream-ranger-xs','skream-ranger-xl']],
    ['8bar','KRZBERG V8',['8bar-krzberg-v8-s','8bar-krzberg-v8-xl']],
  ] as const) {
    await page.getByLabel("Filter by brand").selectOption(brand);
    for (const id of ids) {
      await page
        .getByLabel(label + " variant", { exact: true })
        .selectOption(id);
      await expect(scene).toHaveAttribute("data-frame-variant", id);
      await expect(scene).toHaveAttribute("data-loading", "false");
      for (const view of [
        "side",
        "opposite-side",
        "front",
        "rear",
        "three-quarter",
        "rear-quarter",
        "top",
        "studio",
      ]) {
        await page.getByLabel("Camera view").selectOption(view);
        const b = await projectedBounds(page);
        expect(b.vertices).toBeGreaterThan(10000);
        for (let k = 0; k < 3; k++) {
          expect(b.min[k], `${id}/${view}/min${k}`).toBeGreaterThan(-1);
          expect(b.max[k], `${id}/${view}/max${k}`).toBeLessThan(1);
        }
        const control = await page.getByLabel("Camera view").boundingBox();
        expect(b.bottom).toBeLessThan(control!.y + 1);
      }
    }
  }
  for (const size of [
    { width: 320, height: 812 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    for (const view of ["front", "side", "rear-quarter"]) {
      await page.getByLabel("Camera view").selectOption(view);
      await expect
        .poll(async () => {
          const b = await projectedBounds(page);
          return Math.max(
            ...b.min.slice(0, 2).map(Math.abs),
            ...b.max.slice(0, 2).map(Math.abs),
          );
        })
        .toBeLessThan(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel("Camera view").selectOption("three-quarter");
  const fitted = await projectedBounds(page);
  const canvas = await page.locator("canvas").boundingBox();
  await page.mouse.move(
    canvas!.x + canvas!.width / 2,
    canvas!.y + canvas!.height / 2,
  );
  await page.mouse.wheel(0, -500);
  await expect
    .poll(async () =>
      Math.abs((await projectedBounds(page)).camera[0] - fitted.camera[0]),
    )
    .toBeGreaterThan(0.01);
  await page.getByRole("button", { name: "Reset view", exact: true }).click();
  await expect
    .poll(async () => (await projectedBounds(page)).camera)
    .toEqual(fitted.camera);
  expect(fitted.minDistance).toBeGreaterThan(0.5);
  expect(fitted.maxDistance).toBeGreaterThan(fitted.minDistance);
});
