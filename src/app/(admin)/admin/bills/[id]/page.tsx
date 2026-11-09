"use client";

import { ArrowLeft, Send, Trash2, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill, humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { AdjustBillSheet } from "@/features/billing/components/AdjustBillSheet";
import { useBill, useBillActions } from "@/features/billing/hooks/useBillingAdmin";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatLongDate } from "@/lib/utils/format";
import { formatKobo } from "@/lib/utils/money";
import { usePermission } from "@/providers/AuthProvider";

function Money({ label, kobo, tip, strong }: { label: string; kobo: number; tip?: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">{label}{tip && <InfoTip text={tip} />}</p>
      <p className={`mt-1 tabular-nums ${strong ? "font-display text-3xl" : "text-lg"}`}>{formatKobo(kobo)}</p>
    </div>
  );
}

export default function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const query = useBill(id);
  const canAdjust = usePermission(Perm.BillsAdjust);
  const canIssue = usePermission(Perm.BillsIssue);
  const [adjusting, setAdjusting] = useState(false);
  const actions = useBillActions();

  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={4} />;
  const { bill, adjustments, payments } = query.data;
  const closed = ["cancelled", "written_off", "paid"].includes(bill.status);

  return (
    <div className="space-y-8">
      <Link href="/admin/bills" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Bills</Link>
      <PageHeader eyebrow={bill.reference} title={bill.payment_head_name ?? "Bill"}
        description={`House ${bill.house_identifier} · ${bill.estate_name}`}
        actions={<>
          {bill.status === "draft" && canIssue && <>
            <Button size="sm" onClick={() => actions.issue.mutate([bill.id])}><Send className="size-3.5" /> Send to resident</Button>
            <Button size="sm" variant="outline" onClick={() => actions.deleteDraft.mutate(bill.id, { onSuccess: () => router.replace("/admin/bills") })}><Trash2 className="size-3.5" /> Delete draft</Button>
          </>}
          {canAdjust && !closed && bill.status !== "draft" && <Button size="sm" variant="outline" onClick={() => setAdjusting(true)}><Wrench className="size-3.5" /> Correct</Button>}
        </>} />
      <StatusPill status={bill.status} scope="bill" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Money label="Original amount" kobo={bill.amount_kobo} />
        <Money label="Corrections" kobo={bill.adjustments_kobo} tip={getTooltip("billing.adjust")} />
        <Money label="Paid" kobo={bill.amount_paid_kobo} />
        <Money label="Still owed" kobo={bill.balance_kobo} tip={getTooltip("billing.balance")} strong />
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-5 text-sm md:grid-cols-4">
        <div><dt className="text-xs text-muted-foreground">Period</dt><dd>{bill.period_start ? `${formatLongDate(bill.period_start)} – ${formatLongDate(bill.period_end ?? bill.period_start)}` : "One-time"}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Billing duration</dt><dd>{humanize(bill.frequency)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Issued</dt><dd>{formatLongDate(bill.issue_date)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Due</dt><dd>{formatLongDate(bill.due_date)}</dd></div>
        {bill.description && <div className="col-span-full"><dt className="text-xs text-muted-foreground">Note</dt><dd>{bill.description}</dd></div>}
      </dl>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Payments</h2>
        {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {payments.map((p) => (
              <li key={`${p.payment_reference}-${p.created_at}`} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <Link href={`/admin/payments/${p.payment_reference}`} className="font-mono text-xs hover:text-gold">{p.payment_reference}</Link>
                  <p className="text-xs text-muted-foreground">{humanize(p.channel ?? "")} · {new Date(p.created_at).toLocaleDateString("en-GB")}</p>
                </div>
                <span className={`tabular-nums ${p.amount_kobo < 0 ? "text-danger" : ""}`}>{p.kind === "refund" ? "Refund " : ""}{formatKobo(p.amount_kobo)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1 font-display text-2xl">Corrections <InfoTip text={getTooltip("billing.adjust")} /></h2>
        {adjustments.length === 0 ? <p className="text-sm text-muted-foreground">No corrections.</p> : (
          <ul className="space-y-2">
            {adjustments.map((a) => (
              <li key={a.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                <p className="font-medium">{humanize(a.kind)} · {formatKobo(a.amount_kobo)}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-GB")} · owed before: {formatKobo(a.balance_before_kobo)}</p>
                <p className="mt-1 text-xs italic">“{a.reason}”</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <AdjustBillSheet open={adjusting} onOpenChange={setAdjusting} bill={bill} />
    </div>
  );
}
