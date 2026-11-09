import type { Property, PropertyStatus, PropertyType } from "../types";

export type PropertyFilters = {
  city?: Property["city"] | "all";
  type?: PropertyType | "all";
  status?: PropertyStatus | "all";
  maxPrice?: number;
  search?: string;
};

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  selling: "Now selling",
  offPlan: "Off-plan",
  ready: "Ready to move in",
  soldOut: "Sold out",
};

/**
 * Read-side queries over a list of listings. Pure and synchronous, so it works on the server and in the browser.
 * The list itself comes from `loadProperties()` on the server — see PropertySource.ts.
 */
export class PropertyCatalog {
  constructor(private readonly source: readonly Property[]) {}

  all(): Property[] {
    return [...this.source];
  }

  featured(limit = 4): Property[] {
    return this.source.filter((p) => p.featured).slice(0, limit);
  }

  bySlug(slug: string): Property | undefined {
    return this.source.find((p) => p.slug === slug);
  }

  related(property: Property, limit = 3): Property[] {
    return this.source
      .filter((p) => p.slug !== property.slug)
      .sort((a, b) => Number(b.city === property.city) - Number(a.city === property.city))
      .slice(0, limit);
  }

  filter(filters: PropertyFilters): Property[] {
    const search = filters.search?.trim().toLowerCase();
    return this.source.filter((p) => {
      if (filters.city && filters.city !== "all" && p.city !== filters.city) return false;
      if (filters.type && filters.type !== "all" && p.type !== filters.type) return false;
      if (filters.status && filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.maxPrice && p.priceFrom > filters.maxPrice) return false;
      if (search && !`${p.name} ${p.neighbourhood} ${p.city} ${p.type}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }

  types(): PropertyType[] {
    return [...new Set(this.source.map((p) => p.type))].sort();
  }

  cities(): Property["city"][] {
    return [...new Set(this.source.map((p) => p.city))].sort();
  }
}
