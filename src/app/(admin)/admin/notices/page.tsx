"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { FilterChips, Pagination } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { adminSupportApi } from "@/features/support/api/SupportApi";
import { NoticeCard } from "@/features/support/components/NoticeCard";
import { NoticeSheet } from "@/features/support/components/NoticeSheet";
import { useAdminNotices, useNoticeActions } from "@/features/support/hooks/useSupport";
import { getTooltip } from "@/lib/tooltips/registry";

export default function AdminNoticesPage() {
  const [status, setStatus] = useState<"" | "published" | "draft" | "archived">("published");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const notices = useAdminNotices({ status: status || undefined, page });
  const actions = useNoticeActions();

  return (
    <div className="space-y-6">
      <PageHeader title="Notices" tip={getTooltip("notices.overview")} description="Announcements for all residents, one estate or one house."
        actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> New notice</Button>} />
      <FilterChips label="Notice status" value={status} onChange={(v) => { setStatus(v); setPage(1); }}
        options={[{ value: "published", label: "Published" }, { value: "draft", label: "Drafts" }, { value: "archived", label: "Archived" }, { value: "", label: "All" }]} />
      {notices.error && <ErrorState error={notices.error} onRetry={notices.refetch} />}
      {notices.isLoading && <SkeletonRows rows={3} />}
      {notices.data?.items.length === 0 && <EmptyState title="No notices here" />}
      <div className="space-y-3">
        {notices.data?.items.map((n) => (
          <div key={n.id} className="space-y-2">
            <NoticeCard notice={n} openAttachment={adminSupportApi.attachmentLink} />
            <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
              <span>{humanize(n.status)}{n.publish_at && n.status === "published" && new Date(n.publish_at) > new Date() ? ` · scheduled for ${new Date(n.publish_at).toLocaleString("en-GB")}` : ""}</span>
              {n.expires_at && <span>· until {new Date(n.expires_at).toLocaleDateString("en-GB")}</span>}
              <span className="ml-auto flex gap-2">
                {n.status === "draft" && <Button size="sm" onClick={() => actions.publish.mutate(n.id)}>Publish</Button>}
                {n.status !== "archived" && <Button size="sm" variant="outline" onClick={() => actions.archive.mutate(n.id)}>Archive</Button>}
              </span>
            </div>
          </div>
        ))}
      </div>
      {notices.data && <Pagination page={notices.data.page} pageSize={notices.data.page_size} total={notices.data.total} onPage={setPage} />}
      <NoticeSheet open={creating} onOpenChange={setCreating} />
    </div>
  );
}
