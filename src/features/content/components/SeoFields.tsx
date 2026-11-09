"use client";

import { FormField, inputClass } from "@/components/shared/form/FormField";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

export const SEO_LIMITS = { title: 60, description: 155 } as const;

function Counter({ value, ideal }: { value: string; ideal: number }) {
  const over = value.length > ideal;
  return <span className={cn("text-[0.7rem] tabular-nums", over ? "text-warning" : "text-muted-foreground")}>{value.length}/{ideal}{over ? " — may be cut short" : ""}</span>;
}

/** Roughly how the page will look in Google results, so non-technical staff can see the effect of what they type. */
export function SearchPreview({ title, description, path }: { title: string; description: string; path: string }) {
  const host = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com").replace(/^https?:\/\//, "");
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  return (
    <figure aria-label="Google preview" className="rounded-lg border border-border bg-background p-4 font-sans">
      <figcaption className="mb-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground">Google preview</figcaption>
      <p className="truncate text-xs text-muted-foreground">{host}{path === "/" ? "" : path.replace(/\//g, " › ").replace(/^ › /, " › ")}</p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{cut(title || "Page title", SEO_LIMITS.title)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{cut(description || "Add a description to control what appears here.", SEO_LIMITS.description + 5)}</p>
    </figure>
  );
}

type Props = {
  idPrefix: string;
  path: string;
  title: string;
  description: string;
  /** What the page uses when the boxes are empty. */
  fallbackTitle: string;
  fallbackDescription: string;
  onChange: (patch: { title?: string; description?: string }) => void;
};

/** Search-engine title + description with counters and a live preview. Empty boxes fall back to the page's own text. */
export function SeoFields({ idPrefix, path, title, description, fallbackTitle, fallbackDescription, onChange }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <FormField id={`${idPrefix}-seo-title`} label="Search title" tip={getTooltip("seo.title")}>
          <input id={`${idPrefix}-seo-title`} value={title} maxLength={120} placeholder={fallbackTitle} onChange={(e) => onChange({ title: e.target.value })} className={inputClass} />
          <Counter value={title || fallbackTitle} ideal={SEO_LIMITS.title} />
        </FormField>
        <FormField id={`${idPrefix}-seo-description`} label="Search description" tip={getTooltip("seo.description")}>
          <textarea id={`${idPrefix}-seo-description`} rows={3} value={description} maxLength={320} placeholder={fallbackDescription}
            onChange={(e) => onChange({ description: e.target.value })} className={inputClass} />
          <Counter value={description || fallbackDescription} ideal={SEO_LIMITS.description} />
        </FormField>
      </div>
      <SearchPreview title={title || fallbackTitle} description={description || fallbackDescription} path={path} />
    </div>
  );
}
