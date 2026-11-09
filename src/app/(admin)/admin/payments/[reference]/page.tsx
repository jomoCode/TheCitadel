"use client";

import { ArrowLeft, FileText, RefreshCw, Undo2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill, humanize } from "@/components/shared/app/StatusPill";
import { Button, buttonVariants } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { RefundSheet } from "@/features/billing/components/RefundSheet";
import { usePayment, usePaymentActions } from "@/features/billing/hooks/useBillingAdmin";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo } from "@/lib/utils/money";
import { useAuth } from "@/providers/AuthProvider";

export default function PaymentPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const query = usePayment(reference);
  const { can, user } = useAuth();
  const [refunding, setRefunding] = useState(false);
  const actions = usePaymentActions(reference);

  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={4} />;
  const p = query.data;
  // Owner rule: refunds are for Administrators only (enforced again on the server).
  const canRefund = can(Perm.PaymentsRefund) && Boolean(user?.roles.includes("administrator")) && ["successful", "partially_refunded"].includes(p.status);
  const hasReceipt = ["successful", "partially_refunded", "refunded"].includes(p.status);

  return (
    <div className="space-y-8">
      <Link href="/admin/payments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Payments</Link>
      <PageHeader eyebrow={humanize(p.channel)} title={formatKobo(p.amount_kobo)} description={`${p.reference}${p.resident_name ? ` · ${p.resident_name}` : ""}`}
        actions={<>
          {["initiated", "pending"].includes(p.status) && p.channel === "paystack" && (
            <Button size="sm" variant="outline" onClick={() => actions.reverify.mutate(undefined)} disabled={actions.reverify.isPending}>
              <RefreshCw className="size-3.5" /> Check with Paystack <InfoTip text={getTooltip("payments.reverify")} />
            </Button>
          )}
          {hasReceipt && <Link href={`/admin/payments/${p.reference}/receipt`} className={buttonVariants({ size: "sm", variant: "outline" })}><FileText className="size-3.5" /> Receipt</Link>}
          {canRefund && <Button size="sm" variant="outline" className="border-danger text-danger hover:bg-danger hover:text-white" onClick={() => setRefunding(true)}><Undo2 className="size-3.5" /> Refund</Button>}
        </>} />
      <StatusPill status={p.status} scope="payments" />
      {p.failure_reason && <p className="rounded-brand bg-danger/10 p-3 text-sm text-danger">{p.failure_reason}</p>}
      {p.unallocated_kobo > 0 && <p className="flex items-center gap-1 rounded-brand bg-warning/10 p-3 text-sm text-warning">{formatKobo(p.unallocated_kobo)} was not applied to any bill <InfoTip text={getTooltip("payments.unallocated")} /></p>}

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5 text-sm md:grid-cols-4">
        <div><dt className="text-xs text-muted-foreground">Towards bills</dt><dd className="tabular-nums">{formatKobo(p.amount_kobo)}</dd></div>
        <div><dt className="flex items-center gap-1 text-xs text-muted-foreground">Card fee <InfoTip text={getTooltip("billing.fees")} /></dt><dd className="tabular-nums">{formatKobo(p.fee_kobo)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Total charged</dt><dd className="tabular-nums">{formatKobo(p.total_kobo)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Refunded</dt><dd className="tabular-nums">{formatKobo(p.refunded_kobo)}</dd></div>
        {p.external_reference && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Bank / receipt reference</dt><dd>{p.external_reference}</dd></div>}
        {p.evidence_note && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Note</dt><dd>{p.evidence_note}</dd></div>}
      </dl>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Applied to</h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {(p.allocations.length ? p.allocations : p.items).map((a, i) => (
            <li key={`${a.bill_id}-${i}`} className="flex items-center justify-between p-4 text-sm">
              <Link href={`/admin/bills/${a.bill_id}`} className="hover:text-gold">{a.payment_head_name ?? "Bill"} <span className="font-mono text-xs text-muted-foreground">{a.bill_reference}</span></Link>
              <span className={`tabular-nums ${a.amount_kobo < 0 ? "text-danger" : ""}`}>{a.kind === "refund" ? "Refund " : a.kind === "intended" ? "Intended " : ""}{formatKobo(a.amount_kobo)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">History</h2>
        <ol className="relative space-y-4 border-l border-border pl-5">
          {p.events.map((e, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-gold" aria-hidden />
              <p className="font-medium">{humanize(e.event.replace("payment.", ""))}</p>
              <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("en-GB")}{typeof e.data.reason === "string" && e.data.reason ? ` · ${e.data.reason}` : ""}</p>
            </li>
          ))}
          {p.refunds.map((r) => (
            <li key={r.id} className="relative text-sm">
              <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-danger" aria-hidden />
              <p className="font-medium">Refund {formatKobo(r.amount_kobo)} — {humanize(r.status)}</p>
              <p className="text-xs italic">“{r.reason}”</p>
            </li>
          ))}
        </ol>
      </section>
      <RefundSheet open={refunding} onOpenChange={setRefunding} payment={p} />
    </div>
  );
}
