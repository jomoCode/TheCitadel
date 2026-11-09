"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { PropertyCatalog, type PropertyFilters } from "../services/PropertyCatalog";
import type { Property } from "../types";

type PropertyFiltersContextValue = {
  catalog: PropertyCatalog;
  filters: PropertyFilters;
  results: Property[];
  activeCount: number;
  setFilter: <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => void;
  reset: () => void;
};

const EMPTY: PropertyFilters = { city: "all", type: "all", status: "all", search: "" };
const PropertyFiltersContext = createContext<PropertyFiltersContextValue | null>(null);

/** Holds the property search filters so the filter bar, bottom sheet and grid share state without prop drilling. */
export function PropertyFiltersProvider({ properties, children }: { properties: Property[]; children: React.ReactNode }) {
  const [filters, setFilters] = useState<PropertyFilters>(EMPTY);
  const catalog = useMemo(() => new PropertyCatalog(properties), [properties]);

  const setFilter = useCallback<PropertyFiltersContextValue["setFilter"]>((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const value = useMemo<PropertyFiltersContextValue>(() => {
    const activeCount = (["city", "type", "status"] as const).filter((k) => filters[k] && filters[k] !== "all").length + (filters.search ? 1 : 0);
    return { catalog, filters, results: catalog.filter(filters), activeCount, setFilter, reset: () => setFilters(EMPTY) };
  }, [catalog, filters, setFilter]);

  return <PropertyFiltersContext.Provider value={value}>{children}</PropertyFiltersContext.Provider>;
}

export function usePropertyFilters(): PropertyFiltersContextValue {
  const context = useContext(PropertyFiltersContext);
  if (!context) throw new Error("usePropertyFilters must be used inside <PropertyFiltersProvider>");
  return context;
}
