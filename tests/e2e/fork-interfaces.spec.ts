import { test, expect, type Page } from "@playwright/test";
import type * as THREE from "three";

async function fullBike(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
    const { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState();
    const root = s.scene.getObjectByName("bicycle_assembly");
    root.updateWorldMatrix(true, true);
    s.camera.updateMatrixWorld();
    let max = 0,
      saddles = 0,
      saddleVisible = true,
      minOpacity = 1;
    const p = s.camera.position.clone();
    root.traverse((node: THREE.Object3D) => {
      const mesh = node as THREE.Mesh,
        inst = node as THREE.InstancedMesh;
      if (!mesh.isMesh) return;
      if (node.name === "shaped_padding") {
        saddles++;
        for (
          let parent: THREE.Object3D | null = node;
          parent;
          parent = parent.parent
        )
          saddleVisible &&= parent.visible;
        for (const material of Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material])
          minOpacity = Math.min(minOpacity, material.opacity);
      }
      const pos = mesh.geometry.getAttribute("position"),
        matrix = mesh.matrixWorld.clone(),
        instance = matrix.clone();
      for (let i = 0; i < (inst.isInstancedMesh ? inst.count : 1); i++) {
        matrix.copy(mesh.matrixWorld);
        if (inst.isInstancedMesh) {
          inst.getMatrixAt(i, instance);
          matrix.multiply(instance);
        }
        for (let j = 0; j < pos.count; j++) {
          p.fromBufferAttribute(pos, j).applyMatrix4(matrix).project(s.camera);
          max = Math.max(max, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
        }
      }
    });
    return { max, saddles, saddleVisible, minOpacity };
  });
}

test("source plate patterns agree across viewers and inspection exits restore the entire bike and one visible saddle", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/builder");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [brand, model, id, profile, screws, inserts] of [
    [
      "Cinelli",
      "Vigorelli",
      "cinelli-vigorelli-80s-national-blu-m-v1",
      "vigorelli-2024-removable",
      4,
      2,
    ],
    ["8bar", "KRZBERG V8", "8bar-krzberg-v8-m", "krzberg-v8-double", 6, 4],
  ] as const) {
    await page.getByRole("button", { name: "2D", exact: true }).click();
    await page.getByRole("button", { name: "Frameset", exact: true }).click();
    await page.getByLabel("Filter by brand").selectOption(brand);
    await page.getByLabel(model + " variant", { exact: true }).selectOption(id);
    const svg = page.locator(".bike-svg");
    await expect(svg).toHaveAttribute("data-frame-variant", id);
    await expect(
      svg.locator(`[data-construction-profile="${profile}"]`),
    ).toHaveCount(1);
    await expect(svg.locator("[data-plate-fastener]")).toHaveCount(screws / 2);
    await page.getByRole("button", { name: "3D", exact: true }).click();
    const viewer = page.locator(".bike3d-wrapper");
    await expect(viewer).toHaveAttribute("data-loading", "false");
    await expect(viewer).toHaveAttribute("data-frame-variant", id);
    const actual = await page.evaluate(async () => {
      const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
      const { _roots } = await import(url),
        s = _roots.get(document.querySelector("canvas")).store.getState(),
        root = s.scene.getObjectByName("bicycle_assembly");
      const names: string[] = [];
      root.traverse((n: THREE.Object3D) => names.push(n.name));
      return {
        screws: names.filter((n) => n.startsWith("rear_plate_screw_")).length,
        inserts: names.filter((n) => n.startsWith("rear_insert_")).length,
        shells: names.filter((n) => n === "hub_shell").length,
        nuts: names.filter((n) => n.startsWith("axle_nut_")).length,
        discs: names.filter((n) => n.startsWith("hub_bearing_seat_")).length,
      };
    });
    expect(actual).toEqual({ screws, inserts, shells: 2, nuts: 4, discs: 0 });
    const canvas = await page.locator("canvas").elementHandle();
    for (const exit of ["Return to parts", "Inspect"]) {
      await page.getByRole("button", { name: "Inspect", exact: true }).click();
      const details = page
        .locator("details")
        .filter({ hasText: "Development geometry tools" });
      if (!(await details.evaluate((n) => (n as HTMLDetailsElement).open)))
        await page
          .getByText("Development geometry tools", { exact: true })
          .click();
      for (const target of [
        "dev-front-dropout-left",
        "dev-rear-dropout-left",
        "dev-front-hub",
        "dev-rear-hub",
      ]) {
        await page.getByLabel("Structural close-up").selectOption(target);
        await expect(viewer).toHaveAttribute("data-camera-moving", "false");
      }
      await page.getByRole("button", { name: exit, exact: true }).click();
      await expect.poll(async () => (await fullBike(page)).max).toBeLessThan(1);
      const state = await fullBike(page);
      expect(state).toMatchObject({
        saddles: 1,
        saddleVisible: true,
        minOpacity: 1,
      });
      expect(
        await canvas!.evaluate(
          (node) => node === document.querySelector("canvas"),
        ),
      ).toBe(true);
    }
    for (const view of [
      "side",
      "opposite-side",
      "front",
      "three-quarter",
      "studio",
    ]) {
      await page.getByLabel("Camera view").selectOption(view);
      await expect.poll(async () => (await fullBike(page)).max).toBeLessThan(1);
    }
  }
  expect(errors).toEqual([]);
});
