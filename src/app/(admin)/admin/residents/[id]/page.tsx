"use client";

import { ArrowLeft, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Perm } from "@/features/auth/permissions";
import { AccountActions } from "@/features/estate-core/components/AccountActions";
import { ActivityTimeline } from "@/features/estate-core/components/ActivityTimeline";
import { ResidentHomesPanel } from "@/features/estate-core/components/ResidentHomesPanel";
import { useResident, useResidentActions } from "@/features/estate-core/hooks/usePeople";
import { formatLongDate } from "@/lib/utils/format";
import { usePermission } from "@/providers/AuthProvider";

export default function ResidentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const resident = useResident(id);
  const canManage = usePermission(Perm.ResidentsManage);
  const canAudit = usePermission(Perm.AuditView);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", phone: "" });
  const actions = useResidentActions(id, () => setEditing(false));

  if (resident.error) return <ErrorState error={resident.error} onRetry={resident.refetch} />;
  if (!resident.data) return <SkeletonRows rows={4} />;
  const a = resident.data;

  const openEdit = () => { setDraft({ full_name: a.full_name, phone: a.phone ?? "" }); setEditing(true); };

  return (
    <div className="space-y-8">
      <Link href="/admin/residents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Residents</Link>
      <PageHeader title={a.full_name} description={`Resident since ${formatLongDate(a.created_at.slice(0, 10))}`}
        actions={canManage && <Button size="sm" variant="outline" onClick={openEdit}>Edit details</Button>} />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <StatusPill status={a.status} />
        <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 hover:text-gold"><Mail className="size-4" /> {a.email}</a>
        {a.phone && <a href={`tel:${a.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-1.5 hover:text-gold"><Phone className="size-4" /> {a.phone}</a>}
      </div>

      <ResidentHomesPanel account={a} canManage={canManage} />
      {canManage && <section className="space-y-3"><h2 className="font-display text-2xl">Account</h2><AccountActions account={a} /></section>}
      {canAudit && <section className="space-y-3"><h2 className="font-display text-2xl">Account activity</h2><ActivityTimeline entityType="account" entityId={a.id} /></section>}

      <Sheet open={editing} onOpenChange={setEditing} title="Edit details" description="Email changes go through the resident's own sign-in for security."
        footer={<><Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
          <Button className="flex-2" disabled={draft.full_name.trim().length < 2 || actions.update.isPending}
            onClick={() => actions.update.mutate({ full_name: draft.full_name.trim(), phone: draft.phone.trim() || null })}>Save</Button></>}>
        <div className="space-y-4">
          <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full name</span>
            <input value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
          <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone</span>
            <input type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
        </div>
      </Sheet>
    </div>
  );
}
