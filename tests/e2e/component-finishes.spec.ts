import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type {Product} from '@tracklab/domain';
async function scene(page: Page) {
  return page.evaluate(async () => {
    const url = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/@react-three_fiber.js?"))!.name;
    const { _roots } = await import(url),
      s = _roots.get(document.querySelector("canvas")).store.getState(),
      geometries: string[] = [],
      colors: Record<string, string> = {};
    s.scene
      .getObjectByName("bicycle_assembly")
      .traverse(
        (n: {
          isMesh: boolean;
          name: string;
          material: { name: string; color: { getHexString: () => string } };
          geometry: { uuid: string };
        }) => {
          if (n.isMesh) {
            geometries.push(n.geometry.uuid);
            if (n.material.name.startsWith("finish_"))
              colors[n.name] = n.material.color.getHexString();
          }
        },
      );
    return {
      geometries,
      colors,
      camera: s.camera.position.toArray(),
      memory: { ...s.gl.info.memory },
      frame: s.gl.info.render.frame,
    };
  });
}

test('registered mixed wheel finishes retain separate factory regions across viewers',async({page})=>{
 const credentials=JSON.parse(await readFile('.local/e2e-admin.json','utf8'));
 await page.goto('/');await page.getByRole('button',{name:'Sign in',exact:true}).click();const dialog=page.getByRole('dialog');
 await dialog.getByLabel('Email address').fill(credentials.email);await dialog.getByLabel('Password',{exact:true}).fill(credentials.password);await dialog.getByRole('button',{name:'Sign in',exact:true}).click();await expect(dialog).not.toBeVisible();
 const session=await(await page.request.get('/api/session')).json(),headers={Origin:'http://127.0.0.1:5190','X-CSRF-Token':session.csrf};
 const catalog=await(await page.request.get('/api/admin/catalog')).json(),product:Product=catalog.items.find((r:{data:Product})=>r.data.id==='studio-classic').data,original=structuredClone(product);
 const paint={color:'#80664d',finish:'satin' as const,roughness:.4,metalness:.5,clearcoat:.1,clearcoatRoughness:.4};
 product.variants.push({...structuredClone(product.variants[0]),id:'studio-mixed-finish-fixture',label:'Isolated mixed finish',componentFinishes:[{zone:'wheelset',options:['brand','polished','pure-black'],brand:{...paint,name:'Isolated finish fixture',source:'https://example.com/finish-fixture',regions:{rim:{...paint,color:'#202731'},spokes:{...paint,color:'#b9c2cd',metalness:.85}}}}]});
 const update=await page.request.put('/api/admin/catalog/'+product.id,{headers,data:product});expect(update.status(),await update.text()).toBe(200);
 try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/builder');await page.getByRole('button',{name:'Wheels',exact:true}).click();await page.getByLabel('Classic spokes variant',{exact:true}).selectOption('studio-mixed-finish-fixture');
  await expect(page.locator('linearGradient[id$="-wheel-rim"] stop').nth(3)).toHaveAttribute('stop-color','#202731');
  await expect(page.locator('linearGradient[id$="-wheel-spokes"] stop').nth(3)).toHaveAttribute('stop-color','#b9c2cd');
  await page.getByRole('button',{name:'3D',exact:true}).click();await expect(page.locator('.bike3d-wrapper')).toHaveAttribute('data-loading','false');
  const mixed=await scene(page);expect(mixed.colors).toMatchObject({rim_profile:'202731',laced_spokes:'b9c2cd',hub_shell:'80664d'});
  await page.getByLabel('Wheelset finish',{exact:true}).selectOption('pure-black');await expect.poll(async()=>(await scene(page)).colors).toMatchObject({rim_profile:'202731',laced_spokes:'202731',hub_shell:'202731'});
  await page.getByLabel('Wheelset finish',{exact:true}).selectOption('brand');await expect.poll(async()=>(await scene(page)).colors).toMatchObject(mixed.colors);expect((await scene(page)).geometries).toEqual(mixed.geometries);
 }finally{expect((await page.request.put('/api/admin/catalog/'+product.id,{headers,data:original})).ok()).toBe(true);}
});
test("all controlled component finishes synchronize materials, preserve geometry and support history", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("polished");
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    JSON.stringify({ wheelset: "polished" }),
  );
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    "{}",
  );
  await expect(page.getByLabel("Wheelset finish", { exact: true })).toHaveValue(
    "",
  );
  await page
    .getByRole("button", { name: "Redo selection", exact: true })
    .click();
  await expect(page.getByLabel("Wheelset finish", { exact: true })).toHaveValue(
    "polished",
  );
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
    "data-loading",
    "false",
  );
  const before = await scene(page);
  expect(before.colors.rim_profile).toBe("b9c2cd");
  expect(before.colors.laced_spokes).toBe("b9c2cd");
  expect(before.colors.hub_shell).toBe("b9c2cd");
  let glbs = 0;
  page.on("request", (r) => {
    if (r.url().includes(".glb")) glbs++;
  });
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("pure-black");
  await expect
    .poll(async () => (await scene(page)).colors.laced_spokes)
    .toBe("202731");
  const after = await scene(page);
  expect(after.colors.rim_profile).toBe("202731");
  expect(after.colors.hub_shell).toBe("202731");
  expect(after.geometries).toEqual(before.geometries);
  expect(after.camera).toEqual(before.camera);
  expect(glbs).toBe(0);
  for (let cycle = 0; cycle < 3; cycle++)
    for (const finish of ["polished", "pure-black"]) {
      await page
        .getByLabel("Wheelset finish", { exact: true })
        .selectOption(finish);
      await expect
        .poll(async () => (await scene(page)).colors.rim_profile)
        .toBe(finish === "polished" ? "b9c2cd" : "202731");
    }
  const repeated = await scene(page);
  expect(repeated.memory).toEqual(after.memory);
  expect(repeated.geometries).toEqual(before.geometries);
  expect(glbs).toBe(0);
  await expect
    .poll(async () => {
      const first = await scene(page);
      await page.waitForTimeout(300);
      return (await scene(page)).frame - first.frame;
    })
    .toBe(0);
  await page
    .getByRole("button", { name: "Undo last selection", exact: true })
    .click();
  await expect
    .poll(async () => (await scene(page)).colors.rim_profile)
    .toBe("b9c2cd");
  await page
    .getByRole("button", { name: "Redo selection", exact: true })
    .click();
  await expect
    .poll(async () => (await scene(page)).colors.rim_profile)
    .toBe("202731");
  await page.getByRole("button", { name: "Drivetrain", exact: true }).click();
  await page
    .getByLabel("Crank arms finish", { exact: true })
    .selectOption("polished");
  await page
    .getByLabel("Chainring finish", { exact: true })
    .selectOption("pure-black");
  await expect
    .poll(async () => (await scene(page)).colors.toothed_chainring)
    .toBe("202731");
  expect((await scene(page)).colors.crank_arm_1).toBe("b9c2cd");
  expect((await scene(page)).colors["crank_arm_-1"]).toBe("b9c2cd");
  await page.getByRole("button", { name: "Cockpit", exact: true }).click();
  await page
    .getByLabel("Handlebar finish", { exact: true })
    .selectOption("polished");
  await page
    .getByLabel("Stem finish", { exact: true })
    .selectOption("pure-black");
  for (const [type, label] of [
    ["riser", "City riser"],
    ["flat", "Straight / flat bar"],
    ["bullhorn", "City bullhorn"],
    ["drop", "Track drops"],
  ]) {
    await page.getByLabel("Handlebar type").selectOption(type);
    await page
      .getByRole("button", { name: "Select " + label, exact: true })
      .click();
    await expect(page.locator(".bike3d-wrapper")).toHaveAttribute(
      "data-cockpit-shape",
      type,
    );
    await expect
      .poll(async () => (await scene(page)).colors.continuous_handlebar)
      .toBe("b9c2cd");
    expect((await scene(page)).colors.stem_extension).toBe("202731");
  }
  expect(
    await page
      .getByLabel("Handlebar finish", { exact: true })
      .locator("option")
      .allTextContents(),
  ).toEqual(["Original appearance", "Polished", "Pure Black"]);
  await page.getByRole("button", { name: "Seating", exact: true }).click();
  await page
    .getByLabel("Seatpost finish", { exact: true })
    .selectOption("polished");
  await expect
    .poll(async () => (await scene(page)).colors.seatpost)
    .toBe("b9c2cd");
  const appearance = await page
    .locator(".bike3d-wrapper")
    .getAttribute("data-component-finishes");
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    appearance!,
  );
  await expect(
    page.locator('.bike-svg [data-finish-zone="handlebar"]'),
  ).toHaveAttribute("stroke", /url/);
  expect(errors).toEqual([]);
});
test("mobile finish editing expands cleanly and returns focus to the preview controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/builder");
  const trigger = page.getByRole("button", {
    name: "Choose parts",
    exact: true,
  });
  await trigger.click();
  const sheet = page.getByRole("dialog");
  const before = await sheet.boundingBox();
  await page
    .getByRole("button", { name: "Expand parts selector", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep preview visible", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  expect((await sheet.boundingBox())!.height).toBeGreaterThan(before!.height);
  await sheet.getByLabel("Component category").selectOption("wheels");
  await sheet
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("polished");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    JSON.stringify({ wheelset: "polished" }),
  );
});
test("component finishes and saddle choice survive a different frame diameter, save, garage and image export", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByRole("button", { name: "Wheels", exact: true }).click();
  await page.getByRole('button',{name:'Select Studio 20 / 24',exact:true}).click();
  await page
    .getByLabel("Wheelset finish", { exact: true })
    .selectOption("polished");
  await page.getByRole("button", { name: "Seating", exact: true }).click();
  await page
    .getByRole("button", { name: "Select Everyday saddle", exact: true })
    .click();
  await page
    .getByLabel("Seatpost finish", { exact: true })
    .selectOption("pure-black");
  await page.getByRole("button", { name: "Frameset", exact: true }).click();
  await page.getByLabel("Filter by brand").selectOption("Skream");
  await page
    .getByLabel("Ranger variant", { exact: true })
    .selectOption("skream-ranger-forest-m-v1");
  await expect(
    page.getByRole("dialog", { name: "Review dependent parts" }),
  ).not.toBeVisible();
  await page
    .getByRole("textbox", { name: "Build name", exact: true })
    .fill("Polished finish study");
  await page
    .getByRole("button", { name: "Create account to save", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your name").fill("Finish Rider");
  await dialog
    .getByLabel("Email address")
    .fill(`finish-save-${Date.now()}@example.com`);
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("controlled-finish-test-passphrase");
  await dialog
    .getByRole("button", { name: "Create your account", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\/[a-f0-9]{24}/);
  await page.reload();
  await expect(page.locator('[data-wheel="front"] [data-spoke]')).toHaveCount(20);
  await expect(page.locator('[data-wheel="rear"] [data-spoke]')).toHaveCount(24);
  const appearance = JSON.stringify({
    wheelset: "polished",
    seatpost: "pure-black",
  });
  await expect(page.locator(".bike-svg")).toHaveAttribute(
    "data-component-finishes",
    appearance,
  );
  for (let reload = 0; reload < 2; reload++) {
    await page.reload();
    await expect(page.locator(".bike-svg")).toHaveAttribute(
      "data-component-finishes",
      appearance,
    );
  }
  const other = await page.context().newPage();
  await other.goto(page.url());
  await expect(other.getByRole("alert")).toContainText(
    "open in another editor",
  );
  await other.close();
  await page.getByRole("link", { name: "My garage", exact: true }).click();
  await expect(page.locator(".garage-card .bike-svg")).toHaveAttribute(
    "data-component-finishes",
    appearance,
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Export image of Polished finish study",
      exact: true,
    })
    .click();
  const svg = await readFile((await (await download).path())!, "utf8");
  expect(svg).toContain("#b9c2cd");
  expect(svg).toContain("#202731");
  expect(svg.match(/data-spoke=/g)).toHaveLength(44);
});
