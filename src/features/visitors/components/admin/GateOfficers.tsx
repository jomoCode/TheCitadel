"use client";

import { useMemo, useState } from "react";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { useStaff } from "@/features/estate-core/hooks/usePeople";
import { getTooltip } from "@/lib/tooltips/registry";
import { useSecurityAssignments, useVisitorAdminActions } from "../../hooks/useVisitors";

/** Ties each gate officer to the one estate whose gate they work. Re-assigning simply moves them. */
export function GateOfficers() {
  const assignments = useSecurityAssignments();
  const staff = useStaff({ page_size: 100 });
  const estates = useEstates({ page_size: 100, status: "active" });
  const { assign } = useVisitorAdminActions();
  const [userId, setUserId] = useState("");
  const [estateId, setEstateId] = useState("");

  // Officers with a security-looking role first, so the right people are easy to find; anyone can still be picked.
  const people = useMemo(() => [...(staff.data?.items ?? [])].sort((a, b) =>
    Number(b.roles.some((r) => /secur|gate/i.test(r))) - Number(a.roles.some((r) => /secur|gate/i.test(r))) || a.full_name.localeCompare(b.full_name)), [staff.data]);

  if (assignments.error) return <ErrorState error={assignments.error} onRetry={assignments.refetch} />;
  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm text-muted-foreground">{getTooltip("visitors.assignment")}</p>
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <FormField id="go-user" label="Team member">
          <select id="go-user" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass}>
            <option value="">Choose…</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.full_name}{p.roles.length ? ` (${p.roles.join(", ")})` : ""}</option>)}
          </select>
        </FormField>
        <FormField id="go-estate" label="Estate">
          <select id="go-estate" value={estateId} onChange={(e) => setEstateId(e.target.value)} className={inputClass}>
            <option value="">Choose…</option>
            {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </FormField>
        <Button disabled={!userId || !estateId || assign.isPending}
          onClick={() => assign.mutate({ userId, estateId }, { onSuccess: () => { setUserId(""); setEstateId(""); } })}>Assign</Button>
      </div>
      {assignments.isLoading && <SkeletonRows rows={3} />}
      {assignments.data?.length === 0 && <EmptyState title="No gate officers yet" body="Assign a team member with gate access to an estate." />}
      {assignments.data && assignments.data.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {assignments.data.map((a) => (
            <li key={a.user_id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <span><span className="font-medium">{a.full_name ?? "Unnamed"}</span><span className="block text-xs text-muted-foreground">{a.email}</span></span>
              <span className="rounded-full bg-gold-soft px-3 py-1 text-xs text-gold">{a.estate_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
