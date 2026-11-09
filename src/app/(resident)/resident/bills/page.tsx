"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { BillAlerts } from "@/features/billing/components/BillAlerts";
import { PaySheet } from "@/features/billing/components/PaySheet";
import { ResidentPaymentHistory } from "@/features/billing/components/ResidentPaymentHistory";
import { useResidentBillingSummary } from "@/features/billing/hooks/useResidentBilling";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { formatLongDate } from "@/lib/utils/format";
import { formatKobo } from "@/lib/utils/money";

function OpenBills() {
  const summary = useResidentBillingSummary();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paying, setPaying] = useState(false);

  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.refetch} />;
  if (!summary.data) return <SkeletonRows rows={3} />;
  const { bills, outstanding_kobo, alerts, partial_payments_enabled } = summary.data;
  const chosen = bills.filter((b) => selected.has(b.id));
  const total = chosen.reduce((s, b) => s + b.balance_kobo, 0);
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <div className="rounded-2xl bg-[#140e0c] p-5 text-[#f4ede3]">
        <p className="text-eyebrow text-[#d4af5a]">You owe</p>
        <p className="mt-1 font-display text-4xl tabular-nums">{formatKobo(outstanding_kobo)}</p>
        <p className="mt-1 text-xs text-[#a8998a]">{bills.length} unpaid bill{bills.length === 1 ? "" : "s"}</p>
      </div>
      <BillAlerts alerts={alerts} />
      {bills.length === 0 ? <EmptyState title="You're all paid up" body="New bills will appear here." /> : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1 font-display text-xl">Unpaid bills <InfoTip text={getTooltip("resident.bills.select")} /></h2>
            <button type="button" className="text-sm text-gold" onClick={() => setSelected(selected.size === bills.length ? new Set() : new Set(bills.map((b) => b.id)))}>
              {selected.size === bills.length ? "Clear" : "Select all"}
            </button>
          </div>
          <ul className="space-y-2.5">
            {bills.map((b) => {
              const on = selected.has(b.id);
              return (
                <li key={b.id}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(b.id)}
                    className={cn("flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors active:scale-[0.99]", on ? "border-gold bg-gold-soft" : "border-border bg-surface")}>
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border", on ? "border-gold bg-gold text-[#140e0c]" : "border-border")}>
                      {on && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{b.payment_head_name}</span>
                      <span className="block text-xs text-muted-foreground">House {b.house_identifier} · due {formatLongDate(b.due_date)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block tabular-nums">{formatKobo(b.balance_kobo, { whole: true })}</span>
                      {b.status !== "issued" && <StatusPill status={b.status} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {chosen.length > 0 && (
        <div className="safe-bottom fixed inset-x-0 bottom-[3.9rem] z-30 border-t border-border bg-background/95 p-4 backdrop-blur lg:static lg:rounded-xl lg:border lg:p-5">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <div className="flex-1"><p className="text-xs text-muted-foreground">{chosen.length} selected</p><p className="font-display text-xl tabular-nums">{formatKobo(total)}</p></div>
            <Button size="lg" onClick={() => setPaying(true)}>Pay now</Button>
          </div>
        </div>
      )}
      <PaySheet open={paying} onOpenChange={setPaying} bills={chosen} partialAllowed={partial_payments_enabled} />
    </div>
  );
}

export default function ResidentBillsPage() {
  const [tab, setTab] = useState<"bills" | "history">("bills");
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Bills</h1>
      <div role="tablist" className="grid grid-cols-2 rounded-full border border-border p-1 sm:inline-grid">
        {(["bills", "history"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-2 text-sm", tab === t ? "bg-foreground text-background" : "text-muted-foreground")}>
            {t === "bills" ? "To pay" : "Payment history"}
          </button>
        ))}
      </div>
      {tab === "bills" ? <OpenBills /> : <ResidentPaymentHistory />}
    </div>
  );
}
