import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function wheelScene(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
    const { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      root = s.scene.getObjectByName("bicycle_assembly");
    const front = root.getObjectByName("front_wheel"),
      rear = root.getObjectByName("rear_wheel");
    return {
      depth: front.userData.rimDepth,
      counts: [
        front.getObjectByName("laced_spokes").count,
        rear.getObjectByName("laced_spokes").count,
      ],
      lacing: [front.userData.lacing, rear.userData.lacing],
      unchanged: [
        "shaped_padding",
        "continuous_handlebar",
        "crank_arm_1",
        "rubber_section",
      ].map((name) => root.getObjectByName(name).geometry.uuid),
      colors: ["rim_profile", "laced_spokes", "hub_shell"].map((name) =>
        front.getObjectByName(name).material.color.getHexString(),
      ),
    };
  });
}
test("wheelset counts, lacing, drilling and coordinated finishes agree across both viewers and history", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
    "data-loading",
    "false",
  );
  const original = await wheelScene(page);
  expect(original.counts).toEqual([32, 32]);
  await page
    .getByRole("button", { name: "Select Deep section", exact: true })
    .click();
  await expect
    .poll(() => wheelScene(page))
    .toMatchObject({ counts: [32, 32], unchanged: original.unchanged });
  await page
    .getByRole("button", { name: "Select Studio 20 / 24", exact: true })
    .click();
  await expect
    .poll(() => wheelScene(page))
    .toMatchObject({ counts: [20, 24], lacing: ["radial", "two-cross"] });
  await expect(
    page.locator(".product-option.selected [data-wheel-summary]"),
  ).toContainText("20F / 24R");
  await expect(
    page.locator(".product-option.selected [data-wheel-summary]"),
  ).toBeVisible();
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("pure-black");
  await expect
    .poll(async () => (await wheelScene(page)).colors)
    .toEqual(["202731", "202731", "202731"]);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator('[data-wheel="front"] [data-spoke]')).toHaveCount(
    20,
  );
  await expect(page.locator('[data-wheel="rear"] [data-spoke]')).toHaveCount(
    24,
  );
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect(page.locator('[data-wheel="front"] [data-spoke]')).toHaveCount(
    32,
  );
  await page
    .getByRole("button", { name: "Redo selection", exact: true })
    .click();
  await expect(page.locator('[data-wheel="rear"] [data-spoke]')).toHaveCount(
    24,
  );
});

test("each rim design retains its depth and finish through all three actual spoke configurations", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
    "data-loading",
    "false",
  );
  for (const [name, id, depth] of [
    ["Classic spokes", "studio-classic", 0.025],
    ["Deep section", "studio-deep", 0.06],
    ["Studio 20 / 24", "studio-20-24", 0.03],
    ["Classic spokes / M9 front", "studio-classic-m9", 0.025],
  ] as const) {
    const select = page.getByRole("button", {
      name: "Select " + name,
      exact: true,
    });
    if (await select.isEnabled()) await select.click();
    await page
      .getByLabel("Wheelset finish", { exact: true })
      .selectOption("polished");
    const original = await wheelScene(page);
    for (const [front, rear] of [
      [20, 24],
      [32, 32],
      [36, 36],
    ]) {
      const value =
        id === "studio-20-24" && front === 20 ? id : `${id}-${front}-${rear}`;
      await page
        .getByLabel("Spoke configuration", { exact: true })
        .selectOption(value);
      await expect
        .poll(() => wheelScene(page))
        .toMatchObject({
          depth,
          counts: [front, rear],
          unchanged: original.unchanged,
          colors: ["b9c2cd", "b9c2cd", "b9c2cd"],
        });
      await expect(
        page.locator(".product-option.selected [data-wheel-summary]"),
      ).toContainText(`${front}F / ${rear}R`);
    }
  }
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(72);
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(64);
  await page
    .getByRole("button", { name: "Redo selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(72);
});

test("deep 36/36 drilling and appearance persist through save, reload, garage and image export", async ({
  page,
}) => {
  // A separate isolated member avoids consuming the registration allowance or
  // the admin account's login attempts used by other browser workflows.
  const credentials = JSON.parse(
    await readFile(".local/e2e-rider.json", "utf8"),
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
  await page.goto("/builder");
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Deep section", exact: true })
    .click();
  await page
    .getByLabel("Spoke configuration", { exact: true })
    .selectOption("studio-deep-36-36");
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("pure-black");
  await page
    .getByRole("textbox", { name: "Build name", exact: true })
    .fill("Deep 36 study");
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\/[a-f0-9]{24}/);
  await page.reload();
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(72);
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    JSON.stringify({ wheelset: "pure-black" }),
  );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
    "data-loading",
    "false",
  );
  await expect
    .poll(() => wheelScene(page))
    .toMatchObject({
      depth: 0.06,
      counts: [36, 36],
      lacing: ["three-cross", "three-cross"],
    });
  await page.getByRole("link", { name: "My garage", exact: true }).click();
  await expect(page.locator(".garage-card .bike-svg [data-spoke]")).toHaveCount(
    72,
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export image of Deep 36 study", exact: true })
    .click();
  const svg = await readFile((await (await download).path())!, "utf8");
  expect(svg.match(/data-spoke=/g)).toHaveLength(72);
  expect(svg).toContain("#202731");
});

test("spoke selector fits the mobile parts sheet and changes only the current wheel variant", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/builder");
  await page.getByRole("button", { name: "Choose parts", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Component category").selectOption("wheels");
  await sheet
    .getByLabel("Spoke configuration", { exact: true })
    .selectOption("studio-classic-36-36");
  await expect(page.locator(".bike-svg [data-spoke]")).toHaveCount(72);
  expect(
    await sheet
      .getByLabel("Spoke configuration", { exact: true })
      .evaluate((e) => e.getBoundingClientRect().right <= innerWidth),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Choose parts", exact: true }),
  ).toBeFocused();
});
