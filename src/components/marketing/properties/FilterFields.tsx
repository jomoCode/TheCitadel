"use client";

import { usePropertyFilters } from "@/features/marketing/context/PropertyFiltersContext";
import { STATUS_LABELS } from "@/features/marketing/services/PropertyCatalog";
import type { PropertyFilters } from "@/features/marketing/services/PropertyCatalog";
import { InfoTip } from "@/components/ui/InfoTip";
import { cn } from "@/lib/utils/cn";

type ChipGroupProps<K extends "city" | "type" | "status"> = {
  label: string;
  field: K;
  options: { value: NonNullable<PropertyFilters[K]>; label: string }[];
  tip?: React.ReactNode;
};

function ChipGroup<K extends "city" | "type" | "status">({ label, field, options, tip }: ChipGroupProps<K>) {
  const { filters, setFilter } = usePropertyFilters();
  const current = filters[field] ?? "all";
  return (
    <fieldset>
      <legend className="text-eyebrow mb-3 flex items-center gap-1 text-muted-foreground">{label}{tip}</legend>
      <div className="flex flex-wrap gap-2">
        {[{ value: "all", label: "All" }, ...options].map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={current === option.value}
            onClick={() => setFilter(field, option.value as PropertyFilters[K])}
            className={cn(
              "rounded-full border px-4 py-2 text-xs transition-colors",
              current === option.value ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The filter controls themselves — reused by the desktop bar and the mobile bottom sheet. */
export function FilterFields({ layout }: { layout: "row" | "stack" }) {
  const { catalog } = usePropertyFilters();
  return (
    <div className={cn(layout === "row" ? "flex flex-wrap gap-x-10 gap-y-6" : "space-y-7")}>
      <ChipGroup label="City" field="city" options={catalog.cities().map((c) => ({ value: c, label: c }))} />
      <ChipGroup label="Home type" field="type" options={catalog.types().map((t) => ({ value: t, label: t }))} />
      <ChipGroup
        label="Availability"
        field="status"
        tip={<InfoTip text="Off-plan means the building is still under construction — usually the best prices. Ready means you can move in soon." />}
        options={(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
      />
    </div>
  );
}

export function SearchField({ className }: { className?: string }) {
  const { filters, setFilter } = usePropertyFilters();
  return (
    <label className={cn("block", className)}>
      <span className="sr-only">Search properties</span>
      <input
        type="search"
        value={filters.search ?? ""}
        onChange={(e) => setFilter("search", e.target.value)}
        placeholder="Search by name or neighbourhood"
        className="h-12 w-full rounded-brand border border-border bg-surface px-4 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none"
      />
    </label>
  );
}
