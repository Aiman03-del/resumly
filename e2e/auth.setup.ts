import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

setup("login", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    setup.skip(true, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated browser tests.");
    return;
  }

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(page).toHaveURL(/dashboard|builder/);

  await mkdir("e2e/.auth", { recursive: true });
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});