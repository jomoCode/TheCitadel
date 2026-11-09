"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { useResidentHome } from "@/features/resident/hooks/useResidentHome";
import { GateRequestCard } from "@/features/visitors/components/GateRequestCard";
import { InviteSheet } from "@/features/visitors/components/InviteSheet";
import { PassCard } from "@/features/visitors/components/PassCard";
import { useMyGateRequests, useMyPasses, useMyVisits, useResidentVisitorActions } from "@/features/visitors/hooks/useVisitors";
import type { Invitation } from "@/features/visitors/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

function History() {
  const visits = useMyVisits({ page_size: 50 });
  if (visits.error) return <ErrorState error={visits.error} onRetry={visits.refetch} />;
  if (!visits.data) return <SkeletonRows rows={3} />;
  if (visits.data.items.length === 0) return <EmptyState title="No visits yet" />;
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {visits.data.items.map((v) => (
        <li key={v.id} className="flex items-center justify-between gap-3 p-4 text-sm">
          <div>
            <p className="font-medium">{v.visitor_name}{v.headcount > 1 ? ` +${v.headcount - 1}` : ""}</p>
            <p className="text-xs text-muted-foreground">
              In {new Date(v.entered_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              {v.exited_at && ` · out ${new Date(v.exited_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
            {v.entry_method === "override" && <p className="mt-1 text-xs text-warning">Let in by security without approval: {v.override_reason}</p>}
          </div>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs", v.status === "inside" ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground")}>
            {v.status === "inside" ? "Inside" : "Left"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ResidentVisitorsPage() {
  const [tab, setTab] = useState<"passes" | "history">("passes");
  const [inviting, setInviting] = useState(false);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<Invitation | null>(null);
  const home = useResidentHome();
  const requests = useMyGateRequests();
  const passes = useMyPasses({ page_size: 50 });
  const actions = useResidentVisitorActions();
  const homes = (home.data?.homes ?? []).map((h) => ({ house_id: h.house_id, house_identifier: h.house_identifier, estate_name: h.estate_name }));
  const active = passes.data?.items.filter((p) => p.status === "active") ?? [];
  const past = passes.data?.items.filter((p) => p.status !== "active") ?? [];

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 font-display text-3xl">Visitors <InfoTip text={getTooltip("visitors.overview")} /></h1>
        <Button onClick={() => setInviting(true)} disabled={homes.length === 0}><Plus className="size-4" /> Invite</Button>
      </div>

      {requests.data?.map((r) => (
        <GateRequestCard key={r.id} request={r} busy={actions.decide.isPending} onDecide={(approve) => actions.decide.mutate({ id: r.id, approve })} />
      ))}

      <div role="tablist" className="grid grid-cols-2 rounded-full border border-border p-1 sm:inline-grid">
        {(["passes", "history"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-2 text-sm", tab === t ? "bg-foreground text-background" : "text-muted-foreground")}>
            {t === "passes" ? "Passes" : "Visit history"}
          </button>
        ))}
      </div>

      {tab === "history" ? <History /> : (
        <>
          {passes.error && <ErrorState error={passes.error} onRetry={passes.refetch} />}
          {passes.isLoading && <SkeletonRows rows={3} />}
          {passes.data && active.length === 0 && (
            <EmptyState title="No active passes" body="Expecting someone? Create a pass and send it to them — security will let them straight in."
              action={homes.length > 0 && <Button onClick={() => setInviting(true)}>Invite a visitor</Button>} />
          )}
          <div className="space-y-3">
            {active.map((p) => <PassCard key={p.id} invite={p} expanded={p.id === justCreated} onRevoke={() => setRevoking(p)} />)}
          </div>
          {past.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Earlier passes</h2>
              {past.slice(0, 10).map((p) => <PassCard key={p.id} invite={p} />)}
            </section>
          )}
        </>
      )}

      <InviteSheet open={inviting} onOpenChange={setInviting} homes={homes} onCreated={(created) => { setTab("passes"); setJustCreated(created.id); }} />
      <ConfirmDialog open={revoking !== null} onOpenChange={(o) => !o && setRevoking(null)} tone="danger" pending={actions.revoke.isPending}
        title={`Cancel ${revoking?.visitor_name}'s pass?`} body={getTooltip("visitors.revoke")} confirmLabel="Cancel pass"
        onConfirm={() => revoking && actions.revoke.mutate(revoking.id, { onSuccess: () => setRevoking(null) })} />
    </div>
  );
}
