"use client";

import { Printer } from "lucide-react";
import { humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo } from "@/lib/utils/money";
import type { Receipt } from "../types";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-1.5 text-sm ${strong ? "font-semibold" : ""}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

/** Printable receipt. "Save as PDF" in the print dialog gives residents a downloadable copy. */
export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const paid = receipt.paid_at ? new Date(receipt.paid_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }) : "—";
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-end gap-2 print:hidden">
        <InfoTip text={getTooltip("resident.receipt")} />
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print / save PDF</Button>
      </div>
      <article className="rounded-lg border border-border bg-surface p-6 print:border-0 print:p-0 md:p-10">
        <header className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-display text-2xl">{receipt.company_name}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">{receipt.company_address}</p>
          </div>
          <div className="text-right">
            <p className="text-eyebrow text-gold">Receipt</p>
            <p className="mt-1 font-mono text-xs">{receipt.reference}</p>
          </div>
        </header>
        <dl className="grid grid-cols-2 gap-4 py-6 text-sm">
          <div><dt className="text-xs text-muted-foreground">Received from</dt><dd className="mt-0.5">{receipt.payer_name ?? "—"}</dd><dd className="text-xs text-muted-foreground">{receipt.payer_email}</dd></div>
          <div className="text-right"><dt className="text-xs text-muted-foreground">Date paid</dt><dd className="mt-0.5">{paid}</dd><dd className="text-xs text-muted-foreground">{humanize(receipt.channel)}</dd></div>
        </dl>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2 font-medium">Item</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={`${line.bill_id}-${line.created_at}`} className="border-b border-border/60">
                <td className="py-2.5">{line.payment_head_name ?? "Charge"}<span className="block font-mono text-[0.7rem] text-muted-foreground">{line.bill_reference}</span></td>
                <td className="py-2.5 text-right tabular-nums">{formatKobo(line.amount_kobo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-4 max-w-xs">
          <Row label="Paid towards bills" value={formatKobo(receipt.amount_kobo)} />
          {receipt.fee_kobo > 0 && <Row label="Card processing fee" value={formatKobo(receipt.fee_kobo)} />}
          <Row label="Total paid" value={formatKobo(receipt.total_kobo)} strong />
          {receipt.refunded_kobo > 0 && <Row label="Refunded" value={`− ${formatKobo(receipt.refunded_kobo)}`} />}
        </div>
        <p className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">{receipt.footer}</p>
      </article>
    </div>
  );
}
