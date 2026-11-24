// Facts about the browser and deployment the app is running in.

export type AppEnv = "prod" | "dev";
export type DeviceType = "mobile" | "tablet" | "desktop";

/** Automated browsers and crawlers (Selenium/Playwright, search bots, Lighthouse, prerenderers). */
export function isBot(): boolean {
  return navigator.webdriver === true || /bot|crawl|spider|slurp|headless|lighthouse|prerender/i.test(navigator.userAgent);
}

/** 'dev' for `next dev` and local hosts; 'prod' everywhere else (including preview deploys). */
export function detectEnv(): AppEnv {
  const host = window.location.hostname;
  if (process.env.NODE_ENV === "development") return "dev";
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return "dev";
  return "prod";
}

/** Breakpoints match Tailwind's `md` (768px) and `lg` (1024px). */
export function deviceType(width: number = window.innerWidth): DeviceType {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
