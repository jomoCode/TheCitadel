"use client";

import { Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill, humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { RoleEditorSheet } from "@/features/estate-core/components/RoleEditorSheet";
import { StaffSheet } from "@/features/estate-core/components/StaffSheet";
import { useRoleActions, useRoles, useStaff } from "@/features/estate-core/hooks/usePeople";
import type { Account, Role } from "@/features/estate-core/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

function TeamTab() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<{ member?: Account } | null>(null);
  const staff = useStaff({ q, page });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search team" className="sm:w-80" />
        <Button onClick={() => setSheet({})}><Plus className="size-4" /> Add team member</Button>
      </div>
      {staff.error && <ErrorState error={staff.error} onRetry={staff.refetch} />}
      {staff.isLoading && <SkeletonRows />}
      {staff.data && staff.data.items.length === 0 && <EmptyState title="No team members found" />}
      {staff.data && staff.data.items.length > 0 && (
        <>
          <DataView<Account> rows={staff.data.items} rowKey={(a) => a.id}
            columns={[
              { header: "Name", cell: (a) => <button type="button" className="font-medium hover:text-gold" onClick={() => setSheet({ member: a })}>{a.full_name}</button> },
              { header: "Email", cell: (a) => a.email },
              { header: "Roles", cell: (a) => a.roles.map(humanize).join(", ") },
              { header: "Status", cell: (a) => <StatusPill status={a.status} /> },
            ]}
            card={(a) => (
              <button type="button" className="w-full text-left" onClick={() => setSheet({ member: a })}>
                <p className="font-medium">{a.full_name}</p>
                <p className="text-xs text-muted-foreground">{a.roles.map(humanize).join(", ")}</p>
              </button>
            )} />
          <Pagination page={staff.data.page} pageSize={staff.data.page_size} total={staff.data.total} onPage={setPage} />
        </>
      )}
      <StaffSheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)} member={sheet?.member} />
    </div>
  );
}

function RolesTab() {
  const roles = useRoles();
  const [editing, setEditing] = useState<{ role?: Role } | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const actions = useRoleActions(() => setDeleting(null));

  if (roles.error) return <ErrorState error={roles.error} onRetry={roles.refetch} />;
  if (!roles.data) return <SkeletonRows />;
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing({})}><Plus className="size-4" /> New role</Button></div>
      <ul className="grid gap-3 md:grid-cols-2">
        {roles.data.map((r) => (
          <li key={r.id} className="flex flex-col rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 font-display text-xl">{r.name}{r.is_system && <Lock className="size-3.5 text-gold" aria-label="Built-in role" />}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.description ?? "—"}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">{r.user_count} {r.user_count === 1 ? "person" : "people"}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{r.permissions.length} permissions</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing({ role: r })}>{r.key === "administrator" ? "View" : "Edit"}</Button>
              {!r.is_system && <Button size="sm" variant="outline" aria-label={`Delete ${r.name}`} onClick={() => setDeleting(r)}><Trash2 className="size-3.5" /></Button>}
              {r.is_system && <InfoTip text={getTooltip("admin.role.system")} />}
            </div>
          </li>
        ))}
      </ul>
      <RoleEditorSheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} role={editing?.role} />
      <ConfirmDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)} tone="danger" pending={actions.remove.isPending}
        title={`Delete the ${deleting?.name} role?`} body="Only roles that nobody is using can be deleted." confirmLabel="Delete role"
        onConfirm={() => deleting && actions.remove.mutate(deleting.id)} />
    </div>
  );
}

export default function AccessPage() {
  const [tab, setTab] = useState<"team" | "roles">("team");
  return (
    <div className="space-y-6">
      <PageHeader title="Team & roles" tip={getTooltip("admin.access")} description="Who works here and what each person can do." />
      <div role="tablist" className="inline-flex rounded-full border border-border p-1">
        {(["team", "roles"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-1.5 text-sm", tab === t ? "bg-foreground text-background" : "text-muted-foreground")}>
            {t === "team" ? "Team" : "Roles & permissions"}
          </button>
        ))}
      </div>
      {tab === "team" ? <TeamTab /> : <RolesTab />}
    </div>
  );
}
