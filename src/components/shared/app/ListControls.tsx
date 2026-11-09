"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/** Search box that waits until typing pauses (250 ms) before searching — fewer requests, snappier feel. */
export function SearchInput({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => draft !== value && onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, value, onChange]);

  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-brand border border-border bg-surface pl-10 pr-4 text-base placeholder:text-muted-foreground focus:border-gold focus:outline-none md:text-sm"
      />
    </label>
  );
}

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-4 text-sm">
      <span className="text-muted-foreground">Page {page} of {pages} · {total} total</span>
      <div className="flex gap-2">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-brand border border-border p-2 disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-brand border border-border p-2 disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

export function FilterChips<T extends string>({ options, value, onChange, label }: { options: { value: T | ""; label: string }[]; value: T | ""; onChange: (v: T | "") => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {options.map((o) => (
        <button
          key={o.value || "all"}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs", value === o.value ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
