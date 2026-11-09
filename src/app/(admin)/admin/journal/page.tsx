"use client";

import { ImageOff, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { usePostActions, usePosts } from "@/features/content/hooks/useContent";
import { POST_STATUS_LABELS, type Post, type PostStatus } from "@/features/content/types";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

const FILTER_KEYS = ["status"] as const;
const STATUS = [{ value: "", label: "All" }, ...(["draft", "scheduled", "published", "archived"] as const).map((s) => ({ value: s, label: POST_STATUS_LABELS[s] }))];
const TONE: Record<PostStatus, string> = { draft: "bg-surface-muted text-muted-foreground", scheduled: "bg-info/15 text-info", published: "bg-success/15 text-success", archived: "bg-surface-muted text-muted-foreground" };
const when = (p: Post) => (p.published_at ? new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

function Thumb({ post }: { post: Post }) {
  return (
    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
      {post.featured_image_url ? <Image src={post.featured_image_url} alt="" fill sizes="64px" className="object-cover" /> : <ImageOff className="m-3.5 size-5 text-muted-foreground" aria-hidden />}
    </div>
  );
}

function NewPostSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { create } = usePostActions();
  const [title, setTitle] = useState("");
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New article" description="Give it a working headline — you can change it any time before publishing.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); create.mutate({ title: title.trim() }, { onSuccess: (p) => { onOpenChange(false); router.push(`/admin/journal/${p.id}`); } }); }}>
        <input aria-label="Headline" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Why Asokoro is Abuja’s calmest address" />
        <Button type="submit" disabled={title.trim().length < 3 || create.isPending}>Create draft</Button>
      </form>
    </Sheet>
  );
}

function JournalScreen() {
  const list = useListState(FILTER_KEYS);
  const query = usePosts({ q: list.q, page: list.page, status: (list.filters.status || undefined) as PostStatus | undefined });
  const data = query.data;
  const pill = (p: Post) => <span className={cn("rounded-full px-2.5 py-0.5 text-xs", TONE[p.status])}>{POST_STATUS_LABELS[p.status]}</span>;
  return (
    <div className="space-y-6">
      <PageHeader title="Journal" tip={getTooltip("journal.overview")} description="Articles for the Journal section of your website."
        actions={<Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New article</Button>} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search headlines" className="lg:w-72" />
        <FilterChips label="Status" options={STATUS} value={list.filters.status} onChange={(v) => list.set({ status: v })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="No articles here" body="Write your first article — it stays a draft until you publish it." />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Post> rows={data.items} rowKey={(p) => p.id} href={(p) => `/admin/journal/${p.id}`}
            columns={[
              { header: "Article", cell: (p) => <span className="flex items-center gap-3"><Thumb post={p} /><span>{p.title}<span className="block text-xs font-normal text-muted-foreground">{p.category?.name ?? "No category"} · {p.reading_minutes} min</span></span></span> },
              { header: "Author", cell: (p) => p.author_name },
              { header: "Publish date", cell: when },
              { header: "Status", cell: pill },
            ]}
            card={(p) => (
              <div className="flex gap-3">
                <Thumb post={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><p className="font-medium">{p.title}</p>{pill(p)}</div>
                  <p className="text-xs text-muted-foreground">{p.category?.name ?? "No category"} · {when(p)}</p>
                </div>
              </div>
            )} />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
      <NewPostSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} />
    </div>
  );
}

export default function AdminJournalPage() {
  return <Suspense><JournalScreen /></Suspense>;
}
