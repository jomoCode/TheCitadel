"use client";

import { ArrowLeft, Check, Mail, MessageCircle, Phone, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useState } from "react";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { shortDateTime, whatsappLink } from "@/features/website/format";
import { useEnquiry, useEnquiryActions } from "@/features/website/hooks/useWebsite";
import { ENQUIRY_TYPE_LABELS } from "@/features/website/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

function Notes({ id, canManage }: { id: string; canManage: boolean }) {
  const enquiry = useEnquiry(id);
  const { addNote } = useEnquiryActions(id);
  const [body, setBody] = useState("");
  const notes = enquiry.data?.notes ?? [];
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1 font-display text-2xl">Team notes <InfoTip text={getTooltip("website.notes")} /></h2>
      {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <p className="whitespace-pre-wrap">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">{n.author_name ?? "Team member"} · {shortDateTime(n.created_at)}</p>
          </li>
        ))}
      </ul>
      {canManage && (
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); addNote.mutate(body.trim(), { onSuccess: () => setBody("") }); }}>
          <textarea aria-label="New note" rows={3} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} placeholder="e.g. Called — viewing booked for Saturday 11am" />
          <Button type="submit" size="sm" variant="outline" disabled={!body.trim() || addNote.isPending}>Add note</Button>
        </form>
      )}
    </section>
  );
}

function Detail({ id }: { id: string }) {
  const query = useEnquiry(id);
  const { setHandled } = useEnquiryActions(id);
  const canManage = usePermission(Perm.LeadsManage);
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={4} />;
  const e = query.data;
  const contact = "inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm hover:border-gold";

  return (
    <div className="max-w-3xl space-y-8">
      <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Enquiries</Link>
      <header className="space-y-2">
        <p className="text-eyebrow text-gold">{ENQUIRY_TYPE_LABELS[e.enquiry_type] ?? e.enquiry_type} · {shortDateTime(e.created_at)}</p>
        <h1 className="font-display text-4xl">{e.name}</h1>
        <p className="font-mono text-xs text-muted-foreground">{e.reference}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {e.phone && <a href={`tel:${e.phone}`} className={contact}><Phone className="size-4" /> {e.phone}</a>}
        {e.phone && <a href={whatsappLink(e.phone)} target="_blank" rel="noreferrer" className={contact}><MessageCircle className="size-4" /> WhatsApp</a>}
        <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your Citadel enquiry ${e.reference}`)}`} className={contact}><Mail className="size-4" /> {e.email}</a>
      </div>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{e.message}</p>
        <dl className="grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
          {e.property_name && <div><dt className="text-xs text-muted-foreground">Listing</dt><dd><Link href={`/admin/properties/${e.property_id}`} className="hover:text-gold">{e.property_name}</Link></dd></div>}
          <div><dt className="flex items-center gap-1 text-xs text-muted-foreground">Came from <InfoTip text={getTooltip("website.source")} /></dt><dd>{e.source ?? "Direct visit"}</dd></div>
          {e.source_page && <div><dt className="text-xs text-muted-foreground">Sent from page</dt><dd className="break-all">{e.source_page}</dd></div>}
        </dl>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1 text-sm">
          {e.handled ? <><Check className="size-4 text-success" /> Handled{e.handled_by_name ? ` by ${e.handled_by_name}` : ""}{e.handled_at ? `, ${shortDateTime(e.handled_at)}` : ""}</> : "Not handled yet"}
          <InfoTip text={getTooltip("website.handled")} />
        </p>
        {canManage && (e.handled
          ? <Button variant="outline" size="sm" disabled={setHandled.isPending} onClick={() => setHandled.mutate(false)}><RotateCcw className="size-4" /> Move back to “To handle”</Button>
          : <Button disabled={setHandled.isPending} onClick={() => setHandled.mutate(true)}><Check className="size-4" /> Mark as handled</Button>)}
      </section>

      <Notes id={id} canManage={canManage} />

      {e.other_enquiries.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Earlier enquiries from {e.name.split(" ")[0]}</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {e.other_enquiries.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/enquiries/${o.id}`} className="flex justify-between gap-3 p-3 text-sm hover:bg-surface-muted">
                  <span>{ENQUIRY_TYPE_LABELS[o.enquiry_type] ?? o.enquiry_type}{o.property_name ? ` · ${o.property_name}` : ""}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{shortDateTime(o.created_at)}{o.handled ? " · handled" : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Detail id={id} /></Suspense>;
}
