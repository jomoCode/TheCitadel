import { expect, test } from "./fixtures";

test.describe("Sign-in and protected areas", () => {
  test("login page validates input before contacting the server", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
    await expect(page.getByText("Please enter your password")).toBeVisible();
  });

  for (const area of ["/admin/estates", "/admin/bills", "/admin/support", "/admin/notices", "/resident", "/resident/bills", "/resident/support", "/admin/visitors", "/resident/visitors", "/security", "/security/walkin", "/admin/properties", "/admin/enquiries", "/admin/journal", "/admin/site", "/admin/insights"]) {
    test(`${area} sends signed-out visitors to sign in and remembers where they were going`, async ({ page }) => {
      await page.goto(area, { waitUntil: "networkidle" });
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(area)}`), { timeout: 15_000 });
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    });
  }

  test("an expired invitation link explains what to do", async ({ page }) => {
    await page.goto("/auth/set-password", { waitUntil: "networkidle" });
    await expect(page.getByText(/link has expired or was already used/i)).toBeVisible();
  });

  test("the footer's resident login link now leads to the sign-in page", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "networkidle" });
    await page.getByRole("contentinfo").getByRole("link", { name: "Resident login" }).click();
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible({ timeout: 15_000 });
  });
});
