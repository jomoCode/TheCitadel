"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { StatCard } from "@/components/shared/app/StatCard";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { Perm } from "@/features/auth/permissions";
import { ExportButton } from "@/features/billing/components/ExportButton";
import { useFinanceSummary } from "@/features/billing/hooks/useBillingAdmin";
import type { FinanceRow } from "@/features/billing/types";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo } from "@/lib/utils/money";
import { usePermission } from "@/providers/AuthProvider";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Date range for a preset: the last N days, or (days < 0) the year to date. */
function rangeFor(days: number) {
  const now = new Date();
  return { from: days < 0 ? `${now.getFullYear()}-01-01` : iso(new Date(now.getTime() - days * 86_400_000)), to: iso(now) };
}
const PRESETS = [
  { label: "30 days", days: 30 }, { label: "90 days", days: 90 }, { label: "This year", days: -1 },
];

function Breakdown({ title, rows }: { title: string; rows: FinanceRow[] }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.billed_kobo, r.collected_kobo)));
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="font-display text-xl">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nothing in this period.</p> : (
        <ul className="mt-4 space-y-4">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="flex justify-between gap-3 text-sm"><span className="font-medium">{r.name}</span><span className="tabular-nums text-muted-foreground">{formatKobo(r.collected_kobo, { whole: true })} of {formatKobo(r.billed_kobo, { whole: true })}</span></div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
                <div className="h-full rounded-full bg-gold" style={{ width: `${(r.collected_kobo / max) * 100}%` }} />
              </div>
              {r.outstanding_kobo > 0 && <p className="mt-1 text-xs text-muted-foreground">{formatKobo(r.outstanding_kobo, { whole: true })} still owed</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function FinancePage() {
  const [range, setRange] = useState(() => rangeFor(30));
  const [estateId, setEstateId] = useState("");
  const estates = useEstates({ page_size: 100 });
  const canExport = usePermission(Perm.ReportsExport);
  const summary = useFinanceSummary({ date_from: range.from, date_to: range.to, estate_id: estateId || undefined });
  const s = summary.data;

  const preset = (days: number) => setRange(rangeFor(days));

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Money billed, collected and still owed."
        actions={canExport && <><ExportButton kind="bills" query={{ estate_id: estateId || undefined }} label="Bills CSV" /><ExportButton kind="payments" query={{ date_from: range.from, date_to: range.to }} label="Payments CSV" /></>} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 lg:flex-row lg:items-end">
        <div className="flex gap-2">
          {PRESETS.map((p) => <button key={p.label} type="button" onClick={() => preset(p.days)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground">{p.label}</button>)}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-3">
          <label className="text-xs text-muted-foreground">From<input type="date" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} className={`${inputClass} mt-1`} /></label>
          <label className="text-xs text-muted-foreground">To<input type="date" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} className={`${inputClass} mt-1`} /></label>
          <label className="col-span-2 text-xs text-muted-foreground lg:col-span-1">Estate
            <select value={estateId} onChange={(e) => setEstateId(e.target.value)} className={`${inputClass} mt-1`}>
              <option value="">All estates</option>
              {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      {summary.error && <ErrorState error={summary.error} onRetry={summary.refetch} />}
      {!s && !summary.error && <SkeletonRows rows={2} />}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Billed" value={formatKobo(s.billed_kobo, { whole: true })} hint={`${s.bills_count} bills`} />
            <StatCard label="Collected" value={formatKobo(s.collected_kobo, { whole: true })} tip={getTooltip("finance.collected")} hint={s.refunded_kobo ? `${formatKobo(s.refunded_kobo, { whole: true })} refunded` : undefined} />
            <StatCard label="Still owed" value={formatKobo(s.outstanding_kobo, { whole: true })} tip={getTooltip("finance.outstanding")} hint={`${s.open_bills_count} unpaid bills`} href="/admin/bills?status=open" />
            <StatCard label="Overdue" value={formatKobo(s.overdue_kobo, { whole: true })} hint={`${s.overdue_count} bills`} href="/admin/bills?status=overdue" />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">{s.failed_attempts} payment attempts didn&apos;t go through in this period.</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <Breakdown title="By charge type" rows={s.by_head} />
            <Breakdown title="By estate" rows={s.by_estate} />
          </div>
        </>
      )}
    </div>
  );
}
