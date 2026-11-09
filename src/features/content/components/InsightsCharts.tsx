"use client";

import Link from "next/link";
import { useState } from "react";
import type { DayPoint, Ranked } from "../types";

const shortDay = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * One measure per chart (never two scales on one axis). Single series → no legend; the title names it.
 * Thin columns with a 2px gap, rounded data-ends on the baseline, a hover/focus tooltip per day, and a table view.
 */
export function DailyColumns({ title, points, field }: { title: string; points: DayPoint[]; field: "visitors" | "enquiries" | "page_views" }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p[field]));
  const total = points.reduce((sum, p) => sum + p[field], 0);
  const shown = active !== null ? points[active] : null;
  return (
    <figure className="rounded-lg border border-border bg-surface p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {shown ? `${shortDay(shown.day)}: ${shown[field].toLocaleString()}` : `${total.toLocaleString()} in total`}
        </span>
      </figcaption>
      <div className="relative mt-4 h-36" onMouseLeave={() => setActive(null)}>
        {/* recessive gridlines at 0 / 50% / 100% */}
        {[0, 50, 100].map((g) => <div key={g} className="absolute inset-x-0 border-t border-border/60" style={{ bottom: `${g}%` }} aria-hidden />)}
        <span className="absolute -top-1 right-0 -translate-y-full text-[0.65rem] text-muted-foreground tabular-nums">{max.toLocaleString()}</span>
        <ol className="absolute inset-0 flex items-end gap-[2px]" aria-label={`${title} by day`}>
          {points.map((p, i) => (
            <li key={p.day} className="flex h-full flex-1 items-end">
              <button type="button" aria-label={`${shortDay(p.day)}: ${p[field]}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                className="group flex h-full w-full items-end focus:outline-none">
                <span className={`block w-full rounded-t-[4px] transition-colors ${active === i ? "bg-foreground" : "bg-gold group-focus-visible:bg-foreground"}`}
                  style={{ height: p[field] ? `${Math.max(2, (p[field] / max) * 100)}%` : "0" }} />
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
        <span>{points[0] && shortDay(points[0].day)}</span><span>{points.at(-1) && shortDay(points.at(-1)!.day)}</span>
      </div>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show as a table</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead><tr className="text-left text-muted-foreground"><th className="py-1 font-normal">Day</th><th className="py-1 text-right font-normal">{title}</th></tr></thead>
          <tbody>{points.filter((p) => p[field] > 0).map((p) => <tr key={p.day} className="border-t border-border"><td className="py-1">{shortDay(p.day)}</td><td className="py-1 text-right">{p[field]}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

/** Ranked list with a thin single-hue bar for magnitude; the number is always written, so colour is never the only cue. */
export function RankedBars({ title, items, empty, tip }: { title: string; items: Ranked[]; empty: string; tip?: React.ReactNode }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <section className="rounded-lg border border-border bg-surface p-4">
      <h3 className="flex items-center gap-1 text-sm font-medium">{title}{tip}</h3>
      {items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">{empty}</p> : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.label} className="text-sm">
              <div className="flex justify-between gap-3">
                {item.href ? <Link href={item.href} target={item.href.startsWith("/admin") ? undefined : "_blank"} className="truncate hover:text-gold">{item.label}</Link> : <span className="truncate">{item.label}</span>}
                <span className="shrink-0 tabular-nums text-muted-foreground">{item.value.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-muted"><div className="h-1.5 rounded-full bg-gold" style={{ width: `${(item.value / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
