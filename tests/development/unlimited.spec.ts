import { test, expect } from "@playwright/test";
test("development has no usage locks while authentication and the normal policy remain available", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Local development / usage quotas disabled.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByText("Guest and account access", { exact: true }).click();
  await expect(
    page.getByText(/customize and explore 3D without usage quotas/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start building", exact: true }).click();
  await expect(page.locator(".quota-menu summary")).toHaveText(
    "Development access",
  );
  for (let i = 0; i < 26; i++) {
    await page
      .getByRole("button", {
        name: `Studio Track ${i % 2 ? "Graphite" : "Forest"} finish`,
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: `Studio Track ${i % 2 ? "Graphite" : "Forest"} finish`,
        exact: true,
      }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await expect(
    page.getByRole("button", { name: "Studio Track Acid finish" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await page
    .getByRole("button", { name: "Create account to save", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("without development usage quotas");
  await dialog.getByLabel("Your name").fill("Development Rider");
  await dialog
    .getByLabel("Email address")
    .fill(`development-${Date.now()}@example.test`);
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("development-test-passphrase");
  await dialog
    .getByRole("button", { name: "Create your account", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Save build", exact: true }).click();
  await expect(page).toHaveURL(/\/builder\/[a-f0-9]{24}/);
  await page.getByRole("link", { name: "My garage", exact: true }).click();
  await expect(
    page.getByText("1 saved builds / development access", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Duplicate/ })).toBeEnabled();
  await expect(
    page.getByText(
      /Save, duplicate, publish and export without business quota caps/,
    ),
  ).toBeVisible();
});
