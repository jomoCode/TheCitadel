import { describe, expect, it } from "vitest";
import { normaliseApiUrl } from "@/lib/config/apiBaseUrl";

describe("normaliseApiUrl", () => {
  it("accepts the bare host or the full API path, with or without a trailing slash", () => {
    expect(normaliseApiUrl("https://citadel-api.up.railway.app")).toBe("https://citadel-api.up.railway.app/api/v1");
    expect(normaliseApiUrl("https://citadel-api.up.railway.app/")).toBe("https://citadel-api.up.railway.app/api/v1");
    expect(normaliseApiUrl(" https://citadel-api.up.railway.app/api/v1/ ")).toBe("https://citadel-api.up.railway.app/api/v1");
    expect(normaliseApiUrl("http://localhost:8000/api/v1")).toBe("http://localhost:8000/api/v1");
  });

  it("refuses to guess when the variable is missing or malformed", () => {
    expect(() => normaliseApiUrl(undefined)).toThrow(/NEXT_PUBLIC_API_URL is not set/);
    expect(() => normaliseApiUrl("  ")).toThrow(/not set/);
    expect(() => normaliseApiUrl("citadel-api.up.railway.app")).toThrow(/must start with http/);
  });
});
