import { test, expect, type Page } from "@playwright/test";
async function details(page: Page) {
  return page.evaluate(async () => {
    const url = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name,
      { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      root = s.scene.getObjectByName("bicycle_assembly");
    const post = root.getObjectByName("seatpost"),
      pad = root.getObjectByName("shaped_padding");
    return {
      seatProfile: root.getObjectByName("paint_seat").userData.sectionProfile,
      postType: post.userData.profile || "round",
      radius: post.geometry.parameters?.radiusTop,
      pad: pad.geometry.uuid,
      post: post.geometry.uuid,
      padVisible:
        pad.visible && pad.material.opacity === 1 && !pad.material.transparent,
      postCount: root.getObjectsByProperty("name", "seatpost").length,
      collarCount: root.getObjectsByProperty("name", "seat_collar").length,
      insertCount: root.getObjectsByProperty("name", "rear_insert_1_1").length,
    };
  });
}
test("source tube/post construction agrees across viewers and seating survives wheel changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByLabel("Filter by brand").selectOption("Cinelli");
  await page
    .getByLabel("Vigorelli variant", { exact: true })
    .selectOption("cinelli-vigorelli-80s-national-blu-m-v1");
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-frame-morphology",
    "cinelli-vigorelli-alu-v1",
  );
  await expect(page.locator("[data-post-profile]")).toHaveAttribute(
    "data-post-profile",
    "dedicated-aero",
  );
  await expect(
    page.locator('.bike-svg [data-paint-zone="seat"]'),
  ).toHaveAttribute("fill", /url/);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const viewer = page.locator(".bike3d-wrapper");
  await expect(viewer).toHaveAttribute("data-loading", "false");
  expect(await details(page)).toMatchObject({
    seatProfile: "blade",
    postType: "dedicated-aero",
    padVisible: true,
    postCount: 1,
    collarCount: 1,
  });
  await page.getByLabel("Filter by brand").selectOption("Skream");
  await page
    .getByLabel("Ranger variant", { exact: true })
    .selectOption("skream-ranger-forest-m-v1");
  await expect(viewer).toHaveAttribute(
    "data-frame-morphology",
    "skream-ranger-v1",
  );
  const before = await details(page);
  expect(before).toMatchObject({
    postType: "round",
    padVisible: true,
    postCount: 1,
    collarCount: 1,
  });
  expect(before.radius).toBeCloseTo(0.0158, 7);
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Deep section", exact: true })
    .click();
  await expect
    .poll(() => details(page))
    .toMatchObject({ post: before.post, pad: before.pad, padVisible: true });
  await page.getByRole("button", { name: "Frameset", exact: true }).click();
  await page.getByLabel("Filter by brand").selectOption("8bar");
  await page
    .getByLabel("KRZBERG V8 variant", { exact: true })
    .selectOption("8bar-krzberg-v8-m");
  await expect(viewer).toHaveAttribute(
    "data-frame-morphology",
    "8bar-krzberg-v8-v1",
  );
  await expect
    .poll(() => details(page))
    .toMatchObject({ insertCount: 1, padVisible: true });
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(
    page.locator('.bike-svg [data-dropout-plate="double-sided-inserts"]'),
  ).toBeVisible();
});
