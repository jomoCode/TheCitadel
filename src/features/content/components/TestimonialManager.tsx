"use client";

import { Camera, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { EmptyState, SkeletonRows } from "@/components/shared/app/States";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { useSiteActions, useTestimonials } from "../hooks/useContent";
import type { Testimonial } from "../types";

function NewTestimonialSheet({ onClose }: { onClose: () => void }) {
  const { createTestimonial } = useSiteActions();
  const [f, setF] = useState({ name: "", location: "", purchase: "", quote: "", rating: 5, consent: false });
  const valid = f.name.trim().length >= 2 && f.quote.trim().length >= 10 && f.consent;
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title="New testimonial" description="It stays hidden until you choose to show it."
      footer={<Button className="w-full" disabled={!valid || createTestimonial.isPending}
        onClick={() => createTestimonial.mutate({ name: f.name, location: f.location || null, purchase: f.purchase || null, quote: f.quote, rating: f.rating, consent_confirmed: f.consent }, { onSuccess: onClose })}>Add testimonial</Button>}>
      <div className="space-y-4">
        <FormField id="t-name" label="Client's name (as they want it shown)"><input id="t-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputClass} placeholder="e.g. Amaka O." /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="t-location" label="Where they live (optional)"><input id="t-location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className={inputClass} /></FormField>
          <FormField id="t-purchase" label="What they bought (optional)"><input id="t-purchase" value={f.purchase} onChange={(e) => setF({ ...f, purchase: e.target.value })} className={inputClass} /></FormField>
        </div>
        <FormField id="t-quote" label="Their words"><textarea id="t-quote" rows={5} value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} className={inputClass} /></FormField>
        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rating</legend>
          <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} stars`} aria-pressed={f.rating === n} onClick={() => setF({ ...f, rating: n })}>
              <Star className={`size-6 ${n <= f.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
            </button>))}
          </div>
        </fieldset>
        <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
          <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-5 accent-gold" />
          This client has agreed to their name and words being published on the website.
        </label>
      </div>
    </Sheet>
  );
}

export function TestimonialManager() {
  const items = useTestimonials();
  const actions = useSiteActions();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  if (!items.data) return <SkeletonRows rows={3} />;
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{getTooltip("site.testimonials")}</p>
        <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> Add testimonial</Button>
      </div>
      {items.data.length === 0 && <EmptyState title="No testimonials yet" body="The home page shows a testimonials section only once at least one is shown." />}
      <ul className="space-y-3">
        {items.data.map((t) => (
          <li key={t.id} className="flex gap-3 rounded-lg border border-border bg-surface p-4">
            <label className="relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-full bg-surface-muted" aria-label={`Photo for ${t.name}`}>
              {t.image_url ? <Image src={t.image_url} alt="" fill sizes="56px" className="object-cover" /> : <Camera className="m-4 size-6 text-muted-foreground" />}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && actions.testimonialPhoto.mutate({ id: t.id, file: e.target.files[0] })} />
            </label>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.name} <span className="text-xs font-normal text-muted-foreground">{[t.location, t.purchase].filter(Boolean).join(" · ")}</span></p>
              <p className="line-clamp-3 text-sm text-muted-foreground">“{t.quote}”</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" role="switch" aria-label={`Show ${t.name} on the website`} checked={t.is_published} className="size-5 accent-gold"
                  onChange={(e) => actions.updateTestimonial.mutate({ id: t.id, is_published: e.target.checked })} />
                {t.is_published ? "Shown" : "Hidden"}
              </label>
              <button type="button" aria-label={`Delete testimonial from ${t.name}`} onClick={() => setDeleting(t)} className="rounded p-1 text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      {creating && <NewTestimonialSheet onClose={() => setCreating(false)} />}
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)} tone="danger" pending={actions.remove.isPending}
        title="Delete this testimonial?" body="It will be removed from the website straight away." confirmLabel="Delete"
        onConfirm={() => deleting && actions.remove.mutate({ table: "testimonials", id: deleting.id }, { onSuccess: () => setDeleting(null) })} />
    </div>
  );
}
