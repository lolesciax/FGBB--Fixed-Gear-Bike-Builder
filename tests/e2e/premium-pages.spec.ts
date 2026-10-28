import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("core pages retain their content and fit in both themes on desktop and phone", async ({
  page,
}) => {
  test.setTimeout(90000);
  const fixture = JSON.parse(await readFile(".local/e2e-admin.json", "utf8"));
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address").fill(fixture.email);
  await dialog.getByLabel("Password", { exact: true }).fill(fixture.password);
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 932 });
      for (const [path, heading] of [
        ["/", "Build Beyond the Ordinary."],
        ["/builder", "Bike Builder"],
        ["/catalog", "The parts make the ride."],
        ["/garage", "Good ideas belong here."],
        ["/account", "Make yourself at home."],
        ["/admin", "The catalog workshop."],
      ]) {
        await page.goto(path);
        await expect(
          page.getByRole("heading", { name: heading, exact: true }),
        ).toBeVisible();
        if (path === "/builder")
          await expect(page.locator(".bike-svg")).toBeVisible();
        if (path === "/catalog")
          await expect(page.locator(".catalog-card").first()).toBeVisible();
        if (path === "/admin")
          await expect(
            page.locator(".admin-records button:not(.button)").first(),
          ).toBeVisible();
        if (path === "/garage")
          await expect(
            page.locator(".garage-card,.garage-empty").first(),
          ).toBeVisible();
        if (path === "/account")
          await expect(page.getByLabel("Display name")).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          .toBe(true);
      }
    }
  }
});

test("landing previews stay lightweight and manufacturer links apply real catalog filters", async ({
  page,
}) => {
  const glbs: string[] = [];
  page.on("request", (r) => {
    if (/\.glb/.test(r.url())) glbs.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build Beyond the Ordinary." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-light")
        .evaluate(
          (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
        ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Studio Light", exact: true }).click();
  await expect(page.locator(".environment-preview")).toHaveAttribute(
    "data-environment",
    "light",
  );
  await page.getByRole("button", { name: "Studio Dark", exact: true }).click();
  await expect(page.locator(".environment-preview")).toHaveAttribute(
    "data-environment",
    "dark",
  );
  expect(glbs).toEqual([]);
  await page
    .locator(".manufacturer-strip")
    .getByRole("link", { name: "Cinelli", exact: true })
    .click();
  await expect(page.getByLabel("Catalog manufacturer")).toHaveValue("Cinelli");
  await expect(page.getByLabel("Catalog category")).toHaveValue("frameset");
  await expect(page.locator(".catalog-card")).toHaveCount(1);
  await page.getByLabel("Search catalog").fill("no-such-frame-910271");
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.getByLabel("Catalog manufacturer")).toHaveValue("");
  await expect(page.getByLabel("Catalog category")).toHaveValue("");
  await expect(page.locator(".catalog-card").first()).toBeVisible();
});

test("password visibility, account profile feedback and section links remain accessible", async ({
  page,
}) => {
  const fixture = JSON.parse(await readFile(".local/e2e-admin.json", "utf8"));
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog"),
    password = dialog.getByLabel("Password", { exact: true });
  await dialog.getByLabel("Email address").fill(fixture.email);
  await password.fill(fixture.password);
  await dialog
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await dialog
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto("/account");
  const name = page.getByLabel("Display name");
  await expect(name).toBeVisible();
  const before = await name.inputValue();
  await name.fill("Studio profile review");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Profile updated.");
  await name.fill(before);
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Account sections" })
    .getByRole("link", { name: "Security", exact: true })
    .click();
  await expect(page).toHaveURL(/#security$/);
  await page
    .getByRole("button", { name: "Show current password", exact: true })
    .click();
  await expect(
    page.getByLabel("Current password", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide current password", exact: true })
    .click();
  await expect(
    page.getByLabel("Current password", { exact: true }),
  ).toHaveAttribute("type", "password");
});
