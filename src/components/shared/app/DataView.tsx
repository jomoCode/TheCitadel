"use client";

import Link from "next/link";
import { ResponsiveSwitch } from "@/components/shared/ResponsiveSwitch";
import { SkeletonRows } from "./States";

export type Column<T> = { header: string; cell: (row: T) => React.ReactNode; className?: string };

type DataViewProps<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  href?: (row: T) => string;
  /** Phone layout: one tappable card per row (a table squeezed onto a phone is unreadable). */
  card: (row: T) => React.ReactNode;
};

/** Desktop → table. Phone → stacked tappable cards. Same data, native layout on each device. */
export function DataView<T>({ rows, columns, rowKey, href, card }: DataViewProps<T>) {
  const table = (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.header} scope="col" className={`px-4 py-3 font-medium ${c.className ?? ""}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="group relative hover:bg-surface-muted/50">
              {columns.map((c, i) => (
                <td key={c.header} className={`px-4 py-3 ${c.className ?? ""}`}>
                  {i === 0 && href ? <Link href={href(row)} className="font-medium after:absolute after:inset-0 group-hover:text-gold">{c.cell(row)}</Link> : c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const cards = (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={rowKey(row)}>
          {href ? (
            <Link href={href(row)} className="block rounded-lg border border-border bg-surface p-4 active:scale-[0.99] active:bg-surface-muted">{card(row)}</Link>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-4">{card(row)}</div>
          )}
        </li>
      ))}
    </ul>
  );

  return <ResponsiveSwitch mobile={cards} desktop={table} fallback={<SkeletonRows rows={Math.min(rows.length, 4)} />} />;
}
