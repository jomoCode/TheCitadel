"use client";

import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { residentSupportApi } from "@/features/support/api/SupportApi";
import { AttachmentList, FilePicker } from "@/features/support/components/Attachments";
import { TicketThread } from "@/features/support/components/TicketThread";
import { useMyTicket, useResidentTicketActions } from "@/features/support/hooks/useSupport";
import { TICKET_STATUS_WORDS } from "@/features/support/types";

export default function ResidentTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ticket = useMyTicket(id);
  const actions = useResidentTicketActions(id);
  const [draft, setDraft] = useState("");

  if (ticket.error) return <ErrorState error={ticket.error} onRetry={ticket.refetch} />;
  if (!ticket.data) return <SkeletonRows rows={4} />;
  const t = ticket.data;
  const closed = t.status === "closed";
  const send = () => actions.reply.mutate(draft.trim(), { onSuccess: () => setDraft("") });

  return (
    <div className="space-y-5 pb-40 lg:pb-8">
      <Link href="/resident/support" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Support</Link>
      <header>
        <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
        <h1 className="mt-1 font-display text-2xl md:text-3xl">{t.subject}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.category_name} · House {t.house_identifier}</p>
        <p className="mt-2 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold">{TICKET_STATUS_WORDS[t.status]}</p>
      </header>

      {t.status === "resolved" && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4">
          <p className="font-medium">The team marked this as fixed. Is everything working now?</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => actions.confirm.mutate(undefined)} disabled={actions.confirm.isPending}>Yes, it&apos;s fixed</Button>
            <Button size="sm" variant="outline" onClick={() => actions.reopen.mutate(undefined)} disabled={actions.reopen.isPending}>No, still a problem</Button>
          </div>
        </div>
      )}

      <AttachmentList items={t.attachments} open={residentSupportApi.attachmentLink} />
      <TicketThread events={t.events} perspective="resident" />

      {!closed ? (
        <div className="safe-bottom fixed inset-x-0 bottom-[3.9rem] z-20 border-t border-border bg-background/95 p-3 backdrop-blur lg:static lg:rounded-2xl lg:border lg:p-4">
          <div className="mx-auto flex max-w-5xl items-end gap-2">
            <FilePicker onPick={(f) => actions.upload.mutate(f)} label="Photo" disabled={actions.upload.isPending} />
            <label className="flex-1">
              <span className="sr-only">Your message</span>
              <textarea rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className={`${inputClass} max-h-32 min-h-11 resize-none`} />
            </label>
            <Button aria-label="Send message" disabled={!draft.trim() || actions.reply.isPending} onClick={send} className="h-11 px-4"><Send className="size-4" /></Button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-muted p-4 text-center text-sm text-muted-foreground">This request is closed. If the problem comes back, please raise a new request.</p>
      )}
    </div>
  );
}
