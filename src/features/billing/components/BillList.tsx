"use client";

import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { formatLongDate } from "@/lib/utils/format";
import { formatKobo } from "@/lib/utils/money";
import { useBills } from "../hooks/useBillingAdmin";
import type { Bill } from "../types";

export const BILL_STATUS_FILTERS = [
  { value: "", label: "All" }, { value: "open", label: "Unpaid" }, { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" }, { value: "draft", label: "Drafts" }, { value: "cancelled", label: "Cancelled" },
] as const;

type Props = {
  q: string;
  page: number;
  status: string;
  estateId?: string;
  onChange: (changes: Record<string, string | number | null>) => void;
  onLoaded?: (bills: Bill[]) => void;
  emptyAction?: React.ReactNode;
};

/** Bills as a table (desktop) or tappable cards (phone), with status chips and reference search. */
export function BillList({ q, page, status, estateId, onChange, emptyAction }: Props) {
  const query = useBills({ q, page, status: status || undefined, estate_id: estateId });
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={(value) => onChange({ q: value })} placeholder="Search by bill reference" className="lg:w-72" />
        <FilterChips label="Bill status" options={[...BILL_STATUS_FILTERS]} value={status as ""} onChange={(value) => onChange({ status: value })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="No bills here" body={status || q ? "Try a different filter." : "Create your first bills to get started."} action={!status && !q && emptyAction} />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Bill>
            rows={data.items}
            rowKey={(b) => b.id}
            href={(b) => `/admin/bills/${b.id}`}
            columns={[
              { header: "Bill", cell: (b) => <span>{b.payment_head_name}<span className="block font-mono text-[0.7rem] font-normal text-muted-foreground">{b.reference}</span></span> },
              { header: "House", cell: (b) => `${b.house_identifier} · ${b.estate_name}` },
              { header: "Due", cell: (b) => formatLongDate(b.due_date) },
              { header: "Amount", cell: (b) => formatKobo(b.amount_kobo + b.adjustments_kobo), className: "text-right tabular-nums" },
              { header: "Balance", cell: (b) => formatKobo(b.balance_kobo), className: "text-right tabular-nums" },
              { header: "Status", cell: (b) => <StatusPill status={b.status} scope="bill" /> },
            ]}
            card={(b) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{b.payment_head_name}</p>
                  <p className="truncate text-xs text-muted-foreground">House {b.house_identifier} · {b.estate_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Due {formatLongDate(b.due_date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg tabular-nums">{formatKobo(b.balance_kobo, { whole: true })}</p>
                  <StatusPill status={b.status} />
                </div>
              </div>
            )}
          />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(p) => onChange({ page: p })} />
        </>
      )}
    </div>
  );
}
