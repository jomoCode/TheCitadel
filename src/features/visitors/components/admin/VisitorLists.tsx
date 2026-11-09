"use client";

import { useState } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useAdminGateRequests, useAdminPasses, useAdminVisits, useVisitorAdminActions } from "../../hooks/useVisitors";
import type { GateRequest, Invitation, Visit } from "../../types";
import { windowText } from "../PassCard";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
type ListProps = { estateId?: string; page: number; filter: string; onChange: (p: { page?: number; f?: string }) => void };

const VISIT_FILTERS = [{ value: "", label: "All" }, { value: "inside", label: "Inside now" }, { value: "override", label: "Overrides" }, { value: "walkin", label: "Walk-ins" }];

export function VisitsList({ estateId, page, filter, onChange }: ListProps) {
  const isMethod = filter === "override" || filter === "walkin";
  const q = useAdminVisits({ page, estate_id: estateId, status: filter === "inside" ? "inside" : undefined, method: isMethod ? filter : undefined });
  return (
    <div className="space-y-4">
      <FilterChips label="Show" options={VISIT_FILTERS} value={filter} onChange={(f) => onChange({ f, page: 1 })} />
      {q.error && <ErrorState error={q.error} onRetry={q.refetch} />}
      {q.isLoading && <SkeletonRows />}
      {q.data?.items.length === 0 && <EmptyState title="No visits match" />}
      {q.data && q.data.items.length > 0 && (
        <>
          <DataView<Visit> rows={q.data.items} rowKey={(v) => v.id}
            columns={[
              { header: "Visitor", cell: (v) => <span>{v.visitor_name}{v.headcount > 1 && <span className="text-muted-foreground"> +{v.headcount - 1}</span>}</span> },
              { header: "Home", cell: (v) => `${v.house_identifier} · ${v.estate_name}` },
              { header: "How", cell: (v) => <span className={cn(v.entry_method === "override" && "text-warning")} title={v.override_reason ?? undefined}>{humanize(v.entry_method)}</span> },
              { header: "In", cell: (v) => when(v.entered_at) },
              { header: "Out", cell: (v) => (v.exited_at ? when(v.exited_at) : <span className="text-success">Inside</span>) },
              { header: "Officer", cell: (v) => v.entry_officer_name ?? "—" },
            ]}
            card={(v) => (
              <div>
                <div className="flex justify-between gap-3"><p className="font-medium">{v.visitor_name}</p>{!v.exited_at && <span className="text-xs text-success">Inside</span>}</div>
                <p className="text-xs text-muted-foreground">House {v.house_identifier} · {humanize(v.entry_method)} · {when(v.entered_at)}</p>
                {v.override_reason && <p className="mt-2 rounded bg-warning/10 p-2 text-xs">Override: {v.override_reason}</p>}
              </div>
            )} />
          <Pagination page={q.data.page} pageSize={q.data.page_size} total={q.data.total} onPage={(p) => onChange({ page: p })} />
        </>
      )}
    </div>
  );
}

const PASS_FILTERS = [{ value: "", label: "All" }, { value: "active", label: "Active" }, { value: "used", label: "Used" }, { value: "expired", label: "Expired" }, { value: "revoked", label: "Cancelled" }];

export function PassesList({ estateId, page, filter, onChange }: ListProps) {
  const q = useAdminPasses({ page, estate_id: estateId, status: filter || undefined });
  const { revoke } = useVisitorAdminActions();
  const [target, setTarget] = useState<Invitation | null>(null);
  return (
    <div className="space-y-4">
      <FilterChips label="Status" options={PASS_FILTERS} value={filter} onChange={(f) => onChange({ f, page: 1 })} />
      {q.error && <ErrorState error={q.error} onRetry={q.refetch} />}
      {q.isLoading && <SkeletonRows />}
      {q.data?.items.length === 0 && <EmptyState title="No passes match" />}
      {q.data && q.data.items.length > 0 && (
        <>
          <DataView<Invitation> rows={q.data.items} rowKey={(i) => i.id}
            columns={[
              { header: "Visitor", cell: (i) => <span>{i.visitor_name}<span className="block font-mono text-[0.7rem] text-muted-foreground">{i.reference}</span></span> },
              { header: "Home", cell: (i) => `${i.house_identifier} · ${i.estate_name}` },
              { header: "Valid", cell: (i) => windowText(i.valid_from, i.valid_until) },
              { header: "Status", cell: (i) => <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs text-gold">{humanize(i.status)}</span> },
              { header: "", cell: (i) => i.status === "active" && <Button size="sm" variant="outline" onClick={() => setTarget(i)}>Cancel</Button> },
            ]}
            card={(i) => (
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-medium">{i.visitor_name}</p><p className="text-xs text-muted-foreground">House {i.house_identifier} · {windowText(i.valid_from, i.valid_until)}</p><p className="mt-1 text-xs text-gold">{humanize(i.status)}</p></div>
                {i.status === "active" && <Button size="sm" variant="outline" onClick={() => setTarget(i)}>Cancel</Button>}
              </div>
            )} />
          <Pagination page={q.data.page} pageSize={q.data.page_size} total={q.data.total} onPage={(p) => onChange({ page: p })} />
        </>
      )}
      <ConfirmDialog open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)} requireReason tone="danger" pending={revoke.isPending}
        title={`Cancel ${target?.visitor_name}'s pass?`} body={getTooltip("visitors.revoke")} confirmLabel="Cancel pass"
        onConfirm={(reason) => target && revoke.mutate({ id: target.id, reason }, { onSuccess: () => setTarget(null) })} />
    </div>
  );
}

const REQ_FILTERS = [{ value: "", label: "All" }, { value: "pending", label: "Waiting" }, { value: "rejected", label: "Declined" }, { value: "overridden", label: "Overridden" }];

export function GateRequestsList({ estateId, filter, onChange }: Omit<ListProps, "page">) {
  const q = useAdminGateRequests({ estate_id: estateId, status: filter || undefined });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><FilterChips label="Status" options={REQ_FILTERS} value={filter} onChange={(f) => onChange({ f })} /><InfoTip text={getTooltip("visitors.gateRequest")} /></div>
      {q.error && <ErrorState error={q.error} onRetry={q.refetch} />}
      {q.isLoading && <SkeletonRows />}
      {q.data?.length === 0 && <EmptyState title="No gate requests" body="Visitors who arrive without a pass appear here." />}
      {q.data && q.data.length > 0 && (
        <DataView<GateRequest> rows={q.data} rowKey={(r) => r.id}
          columns={[
            { header: "Visitor", cell: (r) => r.visitor_name },
            { header: "House", cell: (r) => r.house_identifier },
            { header: "Type", cell: (r) => (r.kind === "walkin" ? "No pass" : "Arrival check") },
            { header: "Asked", cell: (r) => when(r.created_at) },
            { header: "Status", cell: (r) => <span className={cn("text-xs", r.status === "overridden" && "text-warning", r.status === "rejected" && "text-danger")}>{humanize(r.status)}</span> },
          ]}
          card={(r) => (
            <div><p className="font-medium">{r.visitor_name} → House {r.house_identifier}</p><p className="text-xs text-muted-foreground">{when(r.created_at)} · {humanize(r.status)}</p></div>
          )} />
      )}
    </div>
  );
}
