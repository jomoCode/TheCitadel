"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, SkeletonRows } from "@/components/shared/app/States";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useFaqs, useSiteActions } from "../hooks/useContent";
import type { Faq } from "../types";

const TOPICS = ["Buying", "Payments", "Living", "Viewing", "Referrals"];

function FaqSheet({ faq, onClose }: { faq: Faq | "new"; onClose: () => void }) {
  const actions = useSiteActions();
  const existing = faq === "new" ? null : faq;
  const [f, setF] = useState({ topic: existing?.topic ?? "Buying", question: existing?.question ?? "", answer: existing?.answer ?? "" });
  const valid = f.topic.trim().length >= 2 && f.question.trim().length >= 5 && f.answer.trim().length >= 5;
  const pending = actions.createFaq.isPending || actions.updateFaq.isPending;
  const submit = () => (existing ? actions.updateFaq.mutate({ id: existing.id, ...f }, { onSuccess: onClose }) : actions.createFaq.mutate(f, { onSuccess: onClose }));
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={existing ? "Edit question" : "New question"}
      footer={<Button className="w-full" disabled={!valid || pending} onClick={submit}>{existing ? "Save" : "Add question"}</Button>}>
      <div className="space-y-4">
        <FormField id="faq-topic" label="Topic">
          <input id="faq-topic" list="faq-topics" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} className={inputClass} />
          <datalist id="faq-topics">{TOPICS.map((t) => <option key={t} value={t} />)}</datalist>
        </FormField>
        <FormField id="faq-question" label="Question"><input id="faq-question" value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} className={inputClass} /></FormField>
        <FormField id="faq-answer" label="Answer"><textarea id="faq-answer" rows={6} value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} className={inputClass} /></FormField>
      </div>
    </Sheet>
  );
}

export function FaqManager() {
  const faqs = useFaqs();
  const actions = useSiteActions();
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);
  if (!faqs.data) return <SkeletonRows rows={4} />;
  const list = faqs.data;
  const move = (i: number, by: -1 | 1) => {
    const ids = list.map((f) => f.id);
    [ids[i], ids[i + by]] = [ids[i + by], ids[i]];
    actions.reorder.mutate({ table: "faqs", ids });
  };
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{getTooltip("site.faqs")}</p>
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="size-4" /> Add question</Button>
      </div>
      {list.length === 0 && <EmptyState title="No questions yet" />}
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {list.map((f, i) => (
          <li key={f.id} className={cn("flex items-start gap-2 p-3", !f.is_published && "opacity-60")}>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gold">{f.topic}{!f.is_published && " · hidden"}</p>
              <p className="font-medium">{f.question}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end">
              <button type="button" aria-label={`Move “${f.question}” up`} disabled={i === 0 || actions.reorder.isPending} onClick={() => move(i, -1)} className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="size-4" /></button>
              <button type="button" aria-label={`Move “${f.question}” down`} disabled={i === list.length - 1 || actions.reorder.isPending} onClick={() => move(i, 1)} className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="size-4" /></button>
              <button type="button" aria-label={f.is_published ? `Hide “${f.question}”` : `Show “${f.question}”`} onClick={() => actions.updateFaq.mutate({ id: f.id, is_published: !f.is_published })} className="rounded p-2 text-muted-foreground hover:text-foreground">{f.is_published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
              <button type="button" aria-label={`Edit “${f.question}”`} onClick={() => setEditing(f)} className="rounded p-2 text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>
              <button type="button" aria-label={`Delete “${f.question}”`} onClick={() => setDeleting(f)} className="rounded p-2 text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      {editing && <FaqSheet key={editing === "new" ? "new" : editing.id} faq={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} tone="danger" pending={actions.remove.isPending}
        title="Delete this question?" body="It will disappear from the FAQs page. To keep it for later, hide it instead." confirmLabel="Delete"
        onConfirm={() => deleting && actions.remove.mutate({ table: "faqs", id: deleting.id }, { onSuccess: () => setDeleting(null) })} />
    </div>
  );
}
