import { describe, expect, it } from "vitest";
import { properties } from "@/content/marketing/properties";
import { PropertyCatalog } from "@/features/marketing/services/PropertyCatalog";

describe("PropertyCatalog", () => {
  const catalog = new PropertyCatalog(properties);

  it("returns only featured properties, capped by limit", () => {
    const featured = catalog.featured(2);
    expect(featured).toHaveLength(2);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("finds a property by slug and returns undefined for unknown slugs", () => {
    expect(catalog.bySlug("cedar-gardens-jabi")?.name).toBe("Cedar Gardens");
    expect(catalog.bySlug("nope")).toBeUndefined();
  });

  it("filters by city, status and free-text search together", () => {
    expect(catalog.filter({ city: "Abuja" }).every((p) => p.city === "Abuja")).toBe(true);
    expect(catalog.filter({ status: "soldOut" }).map((p) => p.slug)).toEqual(["the-regent-townhomes-asokoro"]);
    expect(catalog.filter({ search: "guzape" }).map((p) => p.name)).toEqual(["The Ivory Residences"]);
    expect(catalog.filter({ city: "Abuja", status: "soldOut", search: "guzape" })).toEqual([]);
    expect(catalog.filter({ city: "Lagos" })).toEqual([]); // the site is Abuja-only
  });

  it("treats 'all' as no filter", () => {
    expect(catalog.filter({ city: "all", type: "all", status: "all" })).toHaveLength(properties.length);
  });

  it("filters by maximum price", () => {
    expect(catalog.filter({ maxPrice: 100_000_000 }).every((p) => p.priceFrom <= 100_000_000)).toBe(true);
  });

  it("related() excludes the property itself and prefers the same city", () => {
    const ivory = catalog.bySlug("the-ivory-residences-guzape")!;
    const related = catalog.related(ivory, 3);
    expect(related.find((p) => p.slug === ivory.slug)).toBeUndefined();
    expect(related[0].city).toBe("Abuja");
  });

  it("lists distinct cities and types", () => {
    expect(catalog.cities()).toEqual(["Abuja"]);
    expect(new Set(catalog.types()).size).toBe(catalog.types().length);
  });
});
