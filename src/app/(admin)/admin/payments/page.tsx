"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill, humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { ExportButton } from "@/features/billing/components/ExportButton";
import { OfflinePaymentSheet } from "@/features/billing/components/OfflinePaymentSheet";
import { usePayments } from "@/features/billing/hooks/useBillingAdmin";
import type { Payment } from "@/features/billing/types";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo } from "@/lib/utils/money";
import { usePermission } from "@/providers/AuthProvider";

const STATUS = [
  { value: "", label: "All" }, { value: "successful", label: "Successful" }, { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" }, { value: "abandoned", label: "Abandoned" }, { value: "refunded", label: "Refunded" },
] as const;
const FILTER_KEYS = ["status"] as const;

function PaymentsScreen() {
  const list = useListState(FILTER_KEYS);
  const [recording, setRecording] = useState(false);
  const canRecord = usePermission(Perm.PaymentsRecordOffline);
  const canExport = usePermission(Perm.ReportsExport);
  const query = usePayments({ q: list.q, page: list.page, status: list.filters.status || undefined });
  const data = query.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Every payment attempt — successful or not — is kept for the record."
        actions={<>
          {canExport && <ExportButton kind="payments" query={{ status: list.filters.status || undefined }} />}
          {canRecord && <Button onClick={() => setRecording(true)}><Plus className="size-4" /> Record payment</Button>}
        </>} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search payment or bank reference" className="lg:w-80" />
        <FilterChips label="Payment status" options={[...STATUS]} value={list.filters.status as ""} onChange={(status) => list.set({ status })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="No payments yet" />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Payment>
            rows={data.items}
            rowKey={(p) => p.id}
            href={(p) => `/admin/payments/${p.reference}`}
            columns={[
              { header: "Reference", cell: (p) => <span className="font-mono text-xs">{p.reference}</span> },
              { header: "Payer", cell: (p) => p.resident_name ?? "—" },
              { header: "Method", cell: (p) => humanize(p.channel) },
              { header: "Date", cell: (p) => new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-GB") },
              { header: "Amount", cell: (p) => formatKobo(p.amount_kobo), className: "text-right tabular-nums" },
              { header: "Status", cell: (p) => <StatusPill status={p.status} scope="payments" /> },
            ]}
            card={(p) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.resident_name ?? humanize(p.channel)}</p>
                  <p className="font-mono text-[0.7rem] text-muted-foreground">{p.reference}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(p.paid_at ?? p.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg tabular-nums">{formatKobo(p.amount_kobo, { whole: true })}</p>
                  <StatusPill status={p.status} />
                </div>
              </div>
            )}
          />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
      <p className="text-xs text-muted-foreground">{getTooltip("payments.status.failed")}</p>
      <OfflinePaymentSheet open={recording} onOpenChange={setRecording} />
    </div>
  );
}

export default function PaymentsPage() {
  return <Suspense><PaymentsScreen /></Suspense>;
}
