import { expect, test } from "./fixtures";

const isMobile = (projectName: string) => projectName === "mobile";

test.describe("Marketing website", () => {
  test("home page sells The Citadel: hero, residences, location and the journal", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/the citadel/i);
    await expect(page.getByText("Luxury in Peace & Comfort").first()).toBeVisible();
    await expect(page.getByText("Now selling").first()).toBeVisible();
    await expect(page.getByText("Nnamdi Azikiwe International Airport")).toBeAttached();
    await expect(page.getByText(/lagos/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /location first/i })).toBeVisible();
    await page.getByRole("link", { name: "Register your interest" }).first().click();
    await expect(page).toHaveURL(/\/contact\?type=purchase&property=the-citadel-asokoro/, { timeout: 15_000 });
  });

  test("navigation works on each device type", async ({ page }, info) => {
    await page.goto("/", { waitUntil: "networkidle" });
    if (isMobile(info.project.name)) {
      await page.getByRole("button", { name: /open menu/i }).click();
      await page.getByRole("dialog").getByRole("link", { name: "Properties" }).click();
    } else {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Properties" }).click();
    }
    await expect(page).toHaveURL(/\/properties$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/citadel home/i);
  });

  test("property detail shows facts and an enquiry entry point", async ({ page }, info) => {
    await page.goto("/properties/the-citadel-asokoro", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "The Citadel" })).toBeVisible();
    await expect(page.getByText("Price on request").first()).toBeVisible();
    if (isMobile(info.project.name)) {
      await page.getByRole("button", { name: "Enquire" }).click();
      await expect(page.getByRole("dialog").getByLabel(/full name/i)).toBeVisible();
    } else {
      await expect(page.getByText("Arrange a private viewing")).toBeVisible();
    }
  });

  test("seeded blog article is published and readable", async ({ page }) => {
    await page.goto("/blog", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /location first/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/location first/i);
    await expect(page.getByText(/verify the title/i)).toBeVisible();
  });

  test("tooltips explain features in plain language", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /what does estate management cost/i }).click();
    await expect(page.getByText(/small regular fee/i).first()).toBeVisible();
  });

  test("theme toggle switches to dark mode", async ({ page }) => {
    await page.goto("/faq", { waitUntil: "networkidle" });
    const html = page.locator("html");
    // system → light → dark
    await page.getByRole("button", { name: /theme/i }).click();
    await page.getByRole("button", { name: /theme/i }).click();
    await expect(html).toHaveClass(/dark/);
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("/properties/the-citadel-asokoro");
    expect((await request.get("/robots.txt")).ok()).toBeTruthy();
  });
});
