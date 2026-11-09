"use client";

import { ArrowLeft, Lock, Send } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { adminSupportApi } from "@/features/support/api/SupportApi";
import { AttachmentList, FilePicker } from "@/features/support/components/Attachments";
import { TicketThread } from "@/features/support/components/TicketThread";
import { useAdminTicket, useStaffTicketActions } from "@/features/support/hooks/useSupport";
import { TICKET_STATUS_WORDS, type TicketStatus } from "@/features/support/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { usePermission } from "@/providers/AuthProvider";

const STATUSES = Object.keys(TICKET_STATUS_WORDS) as TicketStatus[];

export default function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = useAdminTicket(id);
  const canManage = usePermission(Perm.TicketsManage);
  const actions = useStaffTicketActions(id);
  const [draft, setDraft] = useState("");
  const [internal, setInternal] = useState(false);
  const [nextStatus, setNextStatus] = useState<"" | TicketStatus>("");

  if (ticket.error) return <ErrorState error={ticket.error} onRetry={ticket.refetch} />;
  if (!ticket.data) return <SkeletonRows rows={4} />;
  const t = ticket.data;
  const send = () => actions.message.mutate({ body: draft.trim(), internal, status: nextStatus || undefined },
    { onSuccess: () => { setDraft(""); setNextStatus(""); } });

  return (
    <div className="space-y-6">
      <Link href="/admin/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Support</Link>
      <PageHeader eyebrow={t.reference} title={t.subject} description={`${t.category_name} · House ${t.house_identifier}, ${t.estate_name} · ${t.resident_name}`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-5">
          <AttachmentList items={t.attachments} open={adminSupportApi.attachmentLink} />
          <TicketThread events={t.events} perspective="staff" />
          {canManage && (
            <div className={cn("space-y-3 rounded-2xl border p-4", internal ? "border-warning/50 bg-warning/5" : "border-border bg-surface")}>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Message type">
                {[false, true].map((isInternal) => (
                  <button key={String(isInternal)} type="button" role="radio" aria-checked={internal === isInternal} onClick={() => setInternal(isInternal)}
                    className={cn("flex items-center gap-1 rounded-full border px-3 py-1 text-xs", internal === isInternal ? "border-foreground bg-foreground text-background" : "border-border")}>
                    {isInternal ? <><Lock className="size-3" /> Internal note</> : "Reply to resident"}
                  </button>
                ))}
                <InfoTip text={getTooltip("support.internal")} />
              </div>
              <label className="block">
                <span className="sr-only">Message</span>
                <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} className={inputClass}
                  placeholder={internal ? "Only staff will see this…" : "Write to the resident…"} />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label="Also change status to" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as TicketStatus | "")} className={cn(inputClass, "w-auto py-2 text-sm")}>
                  <option value="">Keep status ({TICKET_STATUS_WORDS[t.status]})</option>
                  {STATUSES.filter((s) => s !== t.status).map((s) => <option key={s} value={s}>Mark as: {TICKET_STATUS_WORDS[s]}</option>)}
                </select>
                <FilePicker onPick={(file) => actions.upload.mutate({ file, internal })} label="Attach" disabled={actions.upload.isPending} />
                <Button className="ml-auto" disabled={!draft.trim() || actions.message.isPending} onClick={send}><Send className="size-4" /> {internal ? "Save note" : "Send"}</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-10">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-1 font-medium">{TICKET_STATUS_WORDS[t.status]}</p>
          </div>
          {canManage && (
            <label className="block">
              <span className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">Priority <InfoTip text={getTooltip("support.priority")} /></span>
              <select value={t.priority} onChange={(e) => actions.update.mutate({ priority: e.target.value })} className={`${inputClass} mt-1`}>
                {["low", "normal", "high", "urgent"].map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
              </select>
            </label>
          )}
          <dl className="space-y-2 text-sm">
            <div><dt className="text-xs text-muted-foreground">Raised</dt><dd>{new Date(t.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</dd></div>
            {t.resolved_at && <div><dt className="text-xs text-muted-foreground">Resolved</dt><dd>{new Date(t.resolved_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</dd></div>}
            <div><dt className="text-xs text-muted-foreground">Resident</dt><dd><Link href={`/admin/residents/${t.resident_id}`} className="hover:text-gold">{t.resident_name}</Link></dd></div>
            <div><dt className="text-xs text-muted-foreground">House</dt><dd><Link href={`/admin/houses/${t.house_id}`} className="hover:text-gold">{t.house_identifier}</Link></dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
