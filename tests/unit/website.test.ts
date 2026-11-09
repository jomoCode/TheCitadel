import { afterEach, describe, expect, it, vi } from "vitest";
import { fallbackProperties, FALLBACK_IMAGE, fromApi, type ApiProperty } from "@/features/marketing/services/PropertySource";
import { draftFrom, toInput } from "@/features/website/components/ListingForm";
import { whatsappLink } from "@/features/website/format";

const api = (over: Partial<ApiProperty> = {}): ApiProperty => ({
  slug: "palm-crest", name: "Palm Crest", property_type: "Detached Duplexes", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos",
  price_from_kobo: 250_000_000_00, bedrooms_min: 4, bedrooms_max: 5, status: "selling", summary: "Villas with gardens.", description: [],
  features: ["Garden"], amenities: [], units: "", completion: null, payment_plan: false, featured: true, seo_title: null, seo_description: null,
  photos: [{ url: "https://x.supabase.co/a.jpg", alt: "" }], ...over,
});

describe("fromApi (public listing mapping)", () => {
  it("converts kobo to naira and fills sensible defaults", () => {
    const p = fromApi(api());
    expect(p.priceFrom).toBe(250_000_000);
    expect(p.units).toBe("4–5-bedroom homes");
    expect(p.description).toEqual(["Villas with gardens."]);
    expect(p.images).toEqual([{ src: "https://x.supabase.co/a.jpg", alt: "Palm Crest" }]);
    expect(p.seo).toEqual({ title: "Palm Crest", description: "Villas with gardens." });
  });

  it("never leaves a listing without an image", () => {
    expect(fromApi(api({ photos: [] })).images).toEqual([FALLBACK_IMAGE]);
  });
});

describe("fallbackProperties", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("shows nothing in production unless told to use the samples", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(fallbackProperties()).toEqual([]);
    vi.stubEnv("CONTENT_FALLBACK", "seed");
    expect(fallbackProperties().length).toBeGreaterThan(0);
  });
});

describe("listing form → API payload", () => {
  const filled = { ...draftFrom(), name: "Palm Crest", property_type: "Villas", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos", price: "250,000,000" };

  it("sends only the essentials when creating", () => {
    expect(toInput(filled, false)).toEqual({ name: "Palm Crest", property_type: "Villas", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos",
      price_from_kobo: 25_000_000_000, bedrooms_min: 1, bedrooms_max: 1 });
  });

  it("splits paragraphs on blank lines and features on new lines", () => {
    const result = toInput({ ...filled, description: "First para.\n\n\nSecond para.\n", features: "Garden\n\n  Pool \n" }, true);
    expect(result).toMatchObject({ description: ["First para.", "Second para."], features: ["Garden", "Pool"], status: "selling" });
  });

  it("explains what's wrong in plain words", () => {
    expect(toInput({ ...filled, price: "abc" }, false)).toMatch(/starting price/);
    expect(toInput({ ...filled, bedrooms_min: 4, bedrooms_max: 2 }, false)).toMatch(/fewer bedrooms/);
    expect(toInput({ ...filled, city: "" }, false)).toMatch(/location/);
  });
});

describe("whatsappLink", () => {
  it("turns a local Nigerian number into international format", () => {
    expect(whatsappLink("0803 123 4567")).toBe("https://wa.me/2348031234567");
    expect(whatsappLink("+234 (803) 123-4567")).toBe("https://wa.me/2348031234567");
  });
});
