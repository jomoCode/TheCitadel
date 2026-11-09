import { test as base, expect } from "@playwright/test";

/**
 * E2E runs against the production build, whose API URL is a placeholder until deployment.
 * Calls leaving the machine (API, maps, analytics) are answered locally so tests are fast and deterministic.
 */
export const test = base.extend({
  page: async ({ page }, runPage) => {
    await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => {
      const url = route.request().url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return route.continue();
      if (url.includes("/api/v1/")) return route.fulfill({ status: 204, body: "" });
      return route.abort();
    });
    await runPage(page);
  },
});

export { expect };
