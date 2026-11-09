"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { PostEditor } from "@/features/content/components/PostEditor";
import { usePost } from "@/features/content/hooks/useContent";

function Editor({ id }: { id: string }) {
  const post = usePost(id);
  if (post.error) return <ErrorState error={post.error} onRetry={post.refetch} />;
  if (!post.data) return <SkeletonRows rows={5} />;
  return (
    <div className="space-y-6">
      <Link href="/admin/journal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Journal</Link>
      <PostEditor key={post.data.id} post={post.data} />
    </div>
  );
}

export default function JournalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Editor id={id} /></Suspense>;
}
