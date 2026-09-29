import { expect, test } from "@playwright/test";

for (const path of ["/builder/new", "/dashboard", "/account"]) {
  test(`${path} redirects logged-out users to login`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login(?:\?redirectTo=|$)/);
    const loginUrl = new URL(page.url());
    expect(loginUrl.pathname).toBe("/login");
    expect(loginUrl.searchParams.get("redirectTo")).toBe(path);
  });
}

test("the polish API rejects unauthenticated requests", async ({ request }) => {
  const res = await request.post("/api/polish", {
    data: { section: "summary", content: "hi" },
  });
  expect(res.status()).toBe(401);
});