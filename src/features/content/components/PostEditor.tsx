"use client";

import { ExternalLink, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import type { BlogBlock } from "@/features/marketing/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { journalApi } from "../api/ContentApi";
import { useCategories, usePostActions } from "../hooks/useContent";
import { POST_STATUS_LABELS, type Post, type PostInput } from "../types";
import { BlockEditor, cleanBlocks } from "./BlockEditor";
import { SeoFields } from "./SeoFields";

type Draft = { title: string; excerpt: string; category_id: string; tags: string; author_name: string; author_role: string; body: BlogBlock[]; seo_title: string; seo_description: string };

const draftFrom = (p: Post): Draft => ({
  title: p.title, excerpt: p.excerpt, category_id: p.category?.id ?? "", tags: p.tags.join(", "), author_name: p.author_name, author_role: p.author_role ?? "",
  body: p.body, seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "",
});

export function toPostInput(d: Draft): PostInput {
  return {
    title: d.title.trim(), excerpt: d.excerpt.trim(), category_id: d.category_id || null, author_name: d.author_name.trim() || "The Citadel team",
    author_role: d.author_role.trim() || null, body: cleanBlocks(d.body), tags: d.tags.split(",").map((t) => t.trim()).filter(Boolean),
    seo_title: d.seo_title.trim() || null, seo_description: d.seo_description.trim() || null,
  };
}

const localNow = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

function PublishPanel({ post, saveFirst }: { post: Post; saveFirst: () => Promise<unknown> }) {
  const actions = usePostActions(post.id);
  const [when, setWhen] = useState("");
  const [confirm, setConfirm] = useState<"unpublish" | "archive" | null>(null);
  const busy = actions.publish.isPending || actions.save.isPending;
  const go = async (at: string | null) => { await saveFirst(); actions.publish.mutate(at ? new Date(at).toISOString() : null); };
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm"><span className="text-muted-foreground">Status:</span> <strong>{POST_STATUS_LABELS[post.status]}</strong>
          {post.status === "scheduled" && post.published_at && <span className="block text-xs text-muted-foreground">Goes live {new Date(post.published_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>}
        </p>
        {post.is_live && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm hover:text-gold"><ExternalLink className="size-4" /> View</a>}
      </div>
      <Button className="w-full" disabled={busy} onClick={() => go(null)}>{post.is_live ? "Save & update live article" : "Publish now"}</Button>
      {!post.is_live && (
        <div className="space-y-2">
          <label htmlFor="schedule-at" className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Or schedule for <InfoTip text={getTooltip("journal.schedule")} /></label>
          <div className="flex gap-2">
            <input id="schedule-at" type="datetime-local" min={localNow()} value={when} onChange={(e) => setWhen(e.target.value)} className={inputClass} />
            <Button variant="outline" disabled={busy || !when} onClick={() => go(when)}>Schedule</Button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {post.status !== "draft" && <Button size="sm" variant="outline" onClick={() => setConfirm("unpublish")}>Back to draft</Button>}
        {post.status !== "archived" && <Button size="sm" variant="outline" onClick={() => setConfirm("archive")}>Archive</Button>}
      </div>
      <ConfirmDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)} pending={actions.unpublish.isPending || actions.archive.isPending}
        title={confirm === "archive" ? "Archive this article?" : "Take this article off the website?"} body={getTooltip("journal.unpublish")}
        confirmLabel={confirm === "archive" ? "Archive" : "Back to draft"}
        onConfirm={() => (confirm === "archive" ? actions.archive : actions.unpublish).mutate(undefined, { onSuccess: () => setConfirm(null) })} />
    </section>
  );
}

function Cover({ post }: { post: Post }) {
  const { cover } = usePostActions(post.id);
  const input = useRef<HTMLInputElement>(null);
  return (
    <section className="space-y-2">
      <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Cover photo <InfoTip text={getTooltip("journal.cover")} /></p>
      <button type="button" onClick={() => input.current?.click()} disabled={cover.isPending}
        className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-gold">
        {post.featured_image_url ? <Image src={post.featured_image_url} alt={post.featured_image_alt ?? ""} fill sizes="400px" className="object-cover" />
          : <span className="flex items-center gap-2"><ImagePlus className="size-5" /> {cover.isPending ? "Uploading…" : "Add a cover photo"}</span>}
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="Upload cover photo" onChange={(e) => e.target.files?.[0] && cover.mutate(e.target.files[0])} />
    </section>
  );
}

/** The full article editor. Remounted (key) per article so the draft always starts from the saved version. */
export function PostEditor({ post }: { post: Post }) {
  const [d, setD] = useState<Draft>(() => draftFrom(post));
  const categories = useCategories();
  const { save } = usePostActions(post.id);
  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const saveNow = () => save.mutateAsync(toPostInput(d));
  const upload = async (file: File) => (await journalApi.addImage(post.id, file)).url;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-6">
        <FormField id="p-title" label="Headline"><input id="p-title" value={d.title} onChange={(e) => set({ title: e.target.value })} className={`${inputClass} font-display text-xl`} /></FormField>
        <FormField id="p-excerpt" label="Summary" tip={getTooltip("journal.excerpt")}>
          <textarea id="p-excerpt" rows={3} maxLength={400} value={d.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={inputClass} />
        </FormField>
        <BlockEditor blocks={d.body} onChange={(body) => set({ body })} upload={upload} />
        <section className="space-y-3">
          <h2 className="flex items-center gap-1 font-display text-2xl">Search engines <InfoTip text={getTooltip("seo.overview")} /></h2>
          <SeoFields idPrefix="p" path={`/blog/${post.slug}`} title={d.seo_title} description={d.seo_description} fallbackTitle={d.title} fallbackDescription={d.excerpt}
            onChange={(p) => set({ ...(p.title !== undefined && { seo_title: p.title }), ...(p.description !== undefined && { seo_description: p.description }) })} />
        </section>
        <Button disabled={save.isPending || d.title.trim().length < 3} onClick={() => saveNow()}>{save.isPending ? "Saving…" : "Save draft"}</Button>
      </div>
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <PublishPanel post={post} saveFirst={saveNow} />
        <Cover post={post} />
        <FormField id="p-category" label="Category">
          <select id="p-category" value={d.category_id} onChange={(e) => set({ category_id: e.target.value })} className={inputClass}>
            <option value="">No category</option>
            {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField id="p-tags" label="Tags" tip={getTooltip("journal.tags")}><input id="p-tags" value={d.tags} onChange={(e) => set({ tags: e.target.value })} className={inputClass} placeholder="Abuja, Buying tips" /></FormField>
        <FormField id="p-author" label="Author"><input id="p-author" value={d.author_name} onChange={(e) => set({ author_name: e.target.value })} className={inputClass} /></FormField>
        <FormField id="p-role" label="Author's role (optional)"><input id="p-role" value={d.author_role} onChange={(e) => set({ author_role: e.target.value })} className={inputClass} /></FormField>
      </aside>
    </div>
  );
}
