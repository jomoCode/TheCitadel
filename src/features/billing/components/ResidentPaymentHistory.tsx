"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { formatKobo } from "@/lib/utils/money";
import { useResidentPayments } from "../hooks/useResidentBilling";

const WITH_RECEIPT = new Set(["successful", "partially_refunded", "refunded"]);

export function ResidentPaymentHistory() {
  const [page, setPage] = useState(1);
  const payments = useResidentPayments({ page, page_size: 15 });
  if (payments.error) return <ErrorState error={payments.error} onRetry={payments.refetch} />;
  if (!payments.data) return <SkeletonRows rows={3} />;
  if (payments.data.items.length === 0) return <EmptyState title="No payments yet" body="Payments you make will appear here with their receipts." />;

  return (
    <>
      <ul className="space-y-2.5">
        {payments.data.items.map((p) => {
          const body = (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium tabular-nums">{formatKobo(p.total_kobo)}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.paid_at ?? p.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <StatusPill status={p.status} scope="payments" />
              {WITH_RECEIPT.has(p.status) && <ChevronRight className="size-4 text-muted-foreground" aria-hidden />}
            </div>
          );
          return (
            <li key={p.id}>
              {WITH_RECEIPT.has(p.status) ? (
                <Link href={`/resident/payments/${p.reference}/receipt`} aria-label={`Receipt for ${formatKobo(p.total_kobo)}`} className="block rounded-xl border border-border bg-surface p-4 active:bg-surface-muted">{body}</Link>
              ) : (
                <div className="rounded-xl border border-border bg-surface p-4">{body}{p.failure_reason && <p className="mt-2 text-xs text-muted-foreground">{p.failure_reason}</p>}</div>
              )}
            </li>
          );
        })}
      </ul>
      <Pagination page={payments.data.page} pageSize={payments.data.page_size} total={payments.data.total} onPage={setPage} />
    </>
  );
}
