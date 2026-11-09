"use client";

import { ResponsiveSwitch } from "@/components/shared/ResponsiveSwitch";
import { Button } from "@/components/ui/Button";
import { PropertyFiltersProvider, usePropertyFilters } from "@/features/marketing/context/PropertyFiltersContext";
import type { Property } from "@/features/marketing/types";
import { FilterFields, SearchField } from "./FilterFields";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { PropertyCard } from "./PropertyCard";

function DesktopFilterBar() {
  return (
    <div className="space-y-6 border-b border-border pb-8">
      <SearchField className="max-w-md" />
      <FilterFields layout="row" />
    </div>
  );
}

function Results() {
  const { results, reset } = usePropertyFilters();
  if (results.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-2xl">No homes match those filters</p>
        <p className="mt-2 text-sm text-muted-foreground">Try widening your search — or tell us what you are looking for and we will find it.</p>
        <Button variant="outline" className="mt-6" onClick={reset}>Clear filters</Button>
      </div>
    );
  }
  return (
    <>
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">{results.length} {results.length === 1 ? "development" : "developments"}</p>
      <ul className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((property, i) => (
          <li key={property.slug}><PropertyCard property={property} priority={i < 3} /></li>
        ))}
      </ul>
    </>
  );
}

/** Search + filter + results. Mobile uses a bottom sheet; desktop shows filters inline. */
export function PropertyBrowser({ properties }: { properties: Property[] }) {
  return (
    <PropertyFiltersProvider properties={properties}>
      <div className="sticky top-16 z-30 -mx-5 bg-background/95 px-5 py-3 backdrop-blur lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0">
        <ResponsiveSwitch mobile={<MobileFilterSheet />} desktop={<DesktopFilterBar />} fallback={<div className="h-12" />} />
      </div>
      <Results />
    </PropertyFiltersProvider>
  );
}
