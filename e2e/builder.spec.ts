import { stat } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD for authenticated browser tests.");

test("create a resume and download a PDF", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/builder/new");
  await page.locator('input[name="fullName"]').fill("E2E Tester");
  await page.locator('input[name="email"]').fill("e2e@example.com");
  await page.locator('input[name="phone"]').fill("+1 555 0100");
  await page.getByRole("button", { name: "Next step" }).click();

  await page.getByRole("button", { name: "Skip" }).click();
  await page.getByRole("button", { name: "Skip" }).click();

  const skillInput = page.getByPlaceholder(/type a skill and press enter/i);
  await skillInput.fill("TypeScript");
  await skillInput.press("Enter");
  await page.getByRole("button", { name: "Next step" }).click();

  await page.getByRole("button", { name: "Add Project" }).click();
  await page.getByPlaceholder("Resumly").fill("E2E Project");
  await page.getByPlaceholder("What does this project do?").fill("A project created by the browser test.");
  await page.getByRole("button", { name: "Next step" }).click();

  for (let i = 0; i < 6; i += 1) {
    await page.getByRole("button", { name: "Skip" }).click();
  }

  await page.locator("textarea").fill("Software engineer building reliable web applications.");
  await page.getByRole("button", { name: "Choose template" }).click();
  await page.getByRole("button", { name: "Continue to Preview" }).click();
  await expect(page).toHaveURL(/\/preview\//);

  await page.getByRole("button", { name: "Download" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "PDF" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  const downloadedPath = await download.path();
  expect(downloadedPath).toBeTruthy();
  expect((await stat(downloadedPath!)).size).toBeGreaterThan(1000);
});