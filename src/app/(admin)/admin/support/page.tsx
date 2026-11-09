"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { useAdminCategories, useAdminTickets, useCategoryActions } from "@/features/support/hooks/useSupport";
import type { Ticket } from "@/features/support/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { usePermission } from "@/providers/AuthProvider";

const STATUS = [
  { value: "active", label: "Needs attention" }, { value: "open", label: "New" }, { value: "in_progress", label: "In progress" },
  { value: "awaiting_resident", label: "Waiting on resident" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }, { value: "all", label: "All" },
] as const;
const PRIORITY_TONE: Record<string, string> = { urgent: "text-danger", high: "text-warning", normal: "text-muted-foreground", low: "text-muted-foreground" };
const FILTER_KEYS = ["status", "category_id"] as const;

function Queue() {
  const list = useListState(FILTER_KEYS);
  const status = list.filters.status || "active"; // default view: everything that still needs attention
  const query = useAdminTickets({ q: list.q, page: list.page, status: status === "all" ? undefined : status, category_id: list.filters.category_id || undefined });
  const data = query.data;
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search by title or reference" className="lg:w-72" />
        <FilterChips label="Status" options={[...STATUS]} value={status as "active"} onChange={(v) => list.set({ status: v })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="Nothing in this queue" body="New requests from residents appear here." />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Ticket> rows={data.items} rowKey={(t) => t.id} href={(t) => `/admin/support/${t.id}`}
            columns={[
              { header: "Request", cell: (t) => <span>{t.subject}<span className="block font-mono text-[0.7rem] font-normal text-muted-foreground">{t.reference}</span></span> },
              { header: "Category", cell: (t) => t.category_name },
              { header: "Home", cell: (t) => `${t.house_identifier} · ${t.estate_name}` },
              { header: "Priority", cell: (t) => <span className={cn("capitalize", PRIORITY_TONE[t.priority])}>{t.priority}</span> },
              { header: "Updated", cell: (t) => new Date(t.last_activity_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) },
              { header: "Status", cell: (t) => <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs text-gold">{humanize(t.status)}</span> },
            ]}
            card={(t) => (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{t.subject}</p>
                  {t.priority !== "normal" && <span className={cn("text-xs font-medium capitalize", PRIORITY_TONE[t.priority])}>{t.priority}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{t.category_name} · House {t.house_identifier} · {t.resident_name}</p>
                <p className="mt-2 text-xs text-gold">{humanize(t.status)}</p>
              </div>
            )} />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
    </div>
  );
}

function Categories() {
  const categories = useAdminCategories();
  const canManage = usePermission(Perm.TicketsManage);
  const actions = useCategoryActions();
  const [name, setName] = useState("");
  if (!categories.data) return <SkeletonRows rows={3} />;
  return (
    <div className="max-w-xl space-y-4">
      <p className="text-sm text-muted-foreground">{getTooltip("support.categories")}</p>
      {canManage && (
        <div className="flex gap-2">
          <input aria-label="New category" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lifts" className={inputClass} />
          <Button disabled={name.trim().length < 2} onClick={() => actions.create.mutate(name.trim(), { onSuccess: () => setName("") })}><Plus className="size-4" /> Add</Button>
        </div>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {categories.data.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3 text-sm">
            <span className={c.status === "inactive" ? "text-muted-foreground line-through" : ""}>{c.name}</span>
            {canManage && <Button size="sm" variant="outline" onClick={() => actions.toggle.mutate({ id: c.id, status: c.status === "active" ? "inactive" : "active" })}>{c.status === "active" ? "Hide" : "Show"}</Button>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SupportScreen() {
  const [tab, setTab] = useState<"queue" | "categories">("queue");
  return (
    <div className="space-y-6">
      <PageHeader title="Support" tip={getTooltip("support.overview")} description="Maintenance and support requests from residents." />
      <div role="tablist" className="inline-flex rounded-full border border-border p-1">
        {(["queue", "categories"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-1.5 text-sm", tab === t ? "bg-foreground text-background" : "text-muted-foreground")}>
            {t === "queue" ? "Requests" : "Categories"}
          </button>
        ))}
      </div>
      {tab === "queue" ? <Queue /> : <Categories />}
    </div>
  );
}

export default function AdminSupportPage() {
  return <Suspense><SupportScreen /></Suspense>;
}
