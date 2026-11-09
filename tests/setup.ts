import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// next/image → plain <img> in jsdom
vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    default: ({ fill, priority, sizes, ...rest }: Record<string, unknown>) => createElement("img", rest),
  };
});

// Shared, inspectable navigation mock (tests can set navigation.pathname / navigation.search and assert on router calls).
export const navigation = {
  pathname: "/contact",
  search: "",
  router: { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() },
};
(globalThis as { __navigation?: typeof navigation }).__navigation = navigation;

vi.mock("next/navigation", () => {
  const nav = () => (globalThis as unknown as { __navigation: typeof navigation }).__navigation;
  return {
    usePathname: () => nav().pathname,
    useRouter: () => nav().router,
    useSearchParams: () => new URLSearchParams(nav().search),
  };
});

afterEach(() => {
  navigation.pathname = "/contact";
  navigation.search = "";
  Object.values(navigation.router).forEach((fn) => fn.mockReset());
});

// jsdom lacks matchMedia and ResizeObserver (used by Radix and useBreakpoint)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query.includes("min-width: 1024px") ? (globalThis as { __desktop?: boolean }).__desktop ?? false : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }),
});

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
