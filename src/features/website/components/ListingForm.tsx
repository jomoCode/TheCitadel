"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS } from "@/features/marketing/services/PropertyCatalog";
import type { PropertyStatus } from "@/features/marketing/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { koboToInput, parseNairaToKobo } from "@/lib/utils/money";
import { SeoFields } from "@/features/content/components/SeoFields";
import type { Listing, ListingInput } from "../types";

export const COMMON_TYPES = ["Apartments", "Terraces", "Detached Duplexes", "Semi-Detached", "Townhomes", "Serviced Apartments"];

type Draft = {
  name: string; property_type: string; neighbourhood: string; city: string; address: string; price: string;
  bedrooms_min: number; bedrooms_max: number; status: PropertyStatus; summary: string; description: string; features: string;
  seo_title: string; seo_description: string;
};

export function draftFrom(l?: Listing): Draft {
  return {
    name: l?.name ?? "", property_type: l?.property_type ?? "", neighbourhood: l?.neighbourhood ?? "", city: l?.city ?? "",
    address: l?.address ?? "", price: l && l.price_from_kobo > 0 ? koboToInput(l.price_from_kobo) : "", bedrooms_min: l?.bedrooms_min ?? 1, bedrooms_max: l?.bedrooms_max ?? 1,
    status: l?.status ?? "selling", summary: l?.summary ?? "", description: (l?.description ?? []).join("\n\n"), features: (l?.features ?? []).join("\n"),
    seo_title: l?.seo_title ?? "", seo_description: l?.seo_description ?? "",
  };
}

/** Turns the form into the API payload. Returns an error message instead when something needs fixing. */
export function toInput(d: Draft, full: boolean): ListingInput | string {
  const price = d.price.trim() === "" ? 0 : parseNairaToKobo(d.price); // blank = price on request
  if (d.name.trim().length < 2) return "Give the listing a name.";
  if ([d.property_type, d.neighbourhood, d.city].some((v) => v.trim().length < 2) || d.address.trim().length < 3) return "Fill in the home type and full location.";
  if (price === null) return "Enter the starting price in naira, e.g. 185000000.";
  if (d.bedrooms_max < d.bedrooms_min) return "The largest home can't have fewer bedrooms than the smallest.";
  const base: ListingInput = {
    name: d.name.trim(), property_type: d.property_type.trim(), neighbourhood: d.neighbourhood.trim(), city: d.city.trim(), address: d.address.trim(),
    price_from_kobo: price, bedrooms_min: d.bedrooms_min, bedrooms_max: d.bedrooms_max,
  };
  if (!full) return base;
  return {
    ...base, status: d.status, summary: d.summary.trim(),
    description: d.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    features: d.features.split("\n").map((f) => f.trim()).filter(Boolean),
    seo_title: d.seo_title.trim() || null, seo_description: d.seo_description.trim() || null,
  };
}

type Props = { listing?: Listing; full: boolean; pending: boolean; submitLabel: string; onSubmit: (input: ListingInput) => void };

/** Listing details. `full` adds the write-up fields shown on the edit page; creating only asks for the essentials. */
export function ListingForm({ listing, full, pending, submitLabel, onSubmit }: Props) {
  const [d, setD] = useState<Draft>(() => draftFrom(listing));
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Draft>) => { setD((cur) => ({ ...cur, ...patch })); setError(null); };
  const submit = () => {
    const result = toInput(d, full);
    if (typeof result === "string") setError(result);
    else onSubmit(result);
  };
  const beds = (key: "bedrooms_min" | "bedrooms_max", label: string) => (
    <FormField id={`l-${key}`} label={label}>
      <input id={`l-${key}`} type="number" min={0} max={20} inputMode="numeric" value={d[key]}
        onChange={(e) => set({ [key]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })} className={inputClass} />
    </FormField>
  );

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <FormField id="l-name" label="Name"><input id="l-name" value={d.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} placeholder="e.g. The Citadel" /></FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="l-type" label="Home type" tip={getTooltip("website.type")}>
          <input id="l-type" list="l-types" value={d.property_type} onChange={(e) => set({ property_type: e.target.value })} className={inputClass} />
          <datalist id="l-types">{COMMON_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
        </FormField>
        <FormField id="l-price" label="Price from" tip={getTooltip("website.price")}>
          <MoneyInput id="l-price" value={d.price} onChange={(e) => set({ price: e.target.value })} placeholder="Leave blank for “Price on request”" />
        </FormField>
        <FormField id="l-area" label="Neighbourhood"><input id="l-area" value={d.neighbourhood} onChange={(e) => set({ neighbourhood: e.target.value })} className={inputClass} placeholder="e.g. Asokoro" /></FormField>
        <FormField id="l-city" label="City"><input id="l-city" value={d.city} onChange={(e) => set({ city: e.target.value })} className={inputClass} placeholder="e.g. Abuja" /></FormField>
      </div>
      <FormField id="l-address" label="Address"><input id="l-address" value={d.address} onChange={(e) => set({ address: e.target.value })} className={inputClass} /></FormField>
      <div className="grid grid-cols-2 gap-4">{beds("bedrooms_min", "Bedrooms from")}{beds("bedrooms_max", "Bedrooms up to")}</div>

      {full && (
        <>
          <FormField id="l-status" label="Availability" tip={getTooltip("website.status")}>
            <select id="l-status" value={d.status} onChange={(e) => set({ status: e.target.value as PropertyStatus })} className={inputClass}>
              {(Object.keys(STATUS_LABELS) as PropertyStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </FormField>
          <FormField id="l-summary" label="Short description" tip={getTooltip("website.summary")}>
            <textarea id="l-summary" rows={2} maxLength={300} value={d.summary} onChange={(e) => set({ summary: e.target.value })} className={inputClass} />
          </FormField>
          <FormField id="l-description" label="Full description" tip={getTooltip("website.description")}>
            <textarea id="l-description" rows={6} value={d.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} />
          </FormField>
          <FormField id="l-features" label="Features (one per line)" tip={getTooltip("website.features")}>
            <textarea id="l-features" rows={5} value={d.features} onChange={(e) => set({ features: e.target.value })} className={inputClass} placeholder={"Fitted kitchen\nSolar backup\nBoys' quarters"} />
          </FormField>
          <fieldset className="space-y-3">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Search engines</legend>
            <SeoFields idPrefix="l" path={`/properties/${listing?.slug ?? ""}`} title={d.seo_title} description={d.seo_description}
              fallbackTitle={d.name} fallbackDescription={d.summary}
              onChange={(p) => set({ ...(p.title !== undefined && { seo_title: p.title }), ...(p.description !== undefined && { seo_description: p.description }) })} />
          </fieldset>
        </>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
