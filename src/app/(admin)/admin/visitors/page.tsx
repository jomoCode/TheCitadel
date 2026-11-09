"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { StatCard } from "@/components/shared/app/StatCard";
import { inputClass } from "@/components/shared/form/FormField";
import { Perm } from "@/features/auth/permissions";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { GateOfficers } from "@/features/visitors/components/admin/GateOfficers";
import { GateRequestsList, PassesList, VisitsList } from "@/features/visitors/components/admin/VisitorLists";
import { useVisitorDashboard } from "@/features/visitors/hooks/useVisitors";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { usePermission } from "@/providers/AuthProvider";

const TABS = [
  { key: "visits", label: "Visits" },
  { key: "passes", label: "Passes" },
  { key: "requests", label: "Gate requests" },
  { key: "officers", label: "Gate officers" },
] as const;
type Tab = (typeof TABS)[number]["key"];
const FILTER_KEYS = ["tab", "estate_id", "f"] as const;

function VisitorsScreen() {
  const list = useListState(FILTER_KEYS);
  const canAssign = usePermission(Perm.RolesManage);
  const tabs = TABS.filter((t) => t.key !== "officers" || canAssign);
  const tab = (tabs.find((t) => t.key === list.filters.tab)?.key ?? "visits") as Tab;
  const estateId = list.filters.estate_id || undefined;
  const dash = useVisitorDashboard(estateId);
  const estates = useEstates({ page_size: 100, status: "active" });
  const onChange = ({ page, f }: { page?: number; f?: string }) => list.set({ ...(f !== undefined && { f }), ...(page !== undefined && { page }) });

  return (
    <div className="space-y-6">
      <PageHeader title="Visitors" tip={getTooltip("visitors.overview")} description="Who's expected, who's inside, and every entry through the gate."
        actions={(
          <select aria-label="Estate" value={list.filters.estate_id} onChange={(e) => list.set({ estate_id: e.target.value })} className={cn(inputClass, "w-auto")}>
            <option value="">All estates</option>
            {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Expected today" value={dash.data?.expected_today ?? "—"} />
        <StatCard label="Inside now" value={dash.data?.inside_now ?? "—"} />
        <StatCard label="Visits today" value={dash.data?.visits_today ?? "—"} />
        <StatCard label="Waiting at gate" value={dash.data?.pending_walkins ?? "—"} />
        <StatCard label="Overrides (30 days)" value={dash.data?.overrides_30d ?? "—"} tip={getTooltip("visitors.override")} />
      </div>
      <div role="tablist" className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-full sm:border sm:border-border sm:p-1 sm:px-1">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} type="button" onClick={() => list.set({ tab: t.key, f: null })}
            className={cn("shrink-0 rounded-full px-5 py-1.5 text-sm", tab === t.key ? "bg-foreground text-background" : "text-muted-foreground")}>{t.label}</button>
        ))}
      </div>
      {tab === "visits" && <VisitsList estateId={estateId} page={list.page} filter={list.filters.f} onChange={onChange} />}
      {tab === "passes" && <PassesList estateId={estateId} page={list.page} filter={list.filters.f} onChange={onChange} />}
      {tab === "requests" && <GateRequestsList estateId={estateId} filter={list.filters.f} onChange={onChange} />}
      {tab === "officers" && <GateOfficers />}
    </div>
  );
}

export default function AdminVisitorsPage() {
  return <Suspense><VisitorsScreen /></Suspense>;
}
