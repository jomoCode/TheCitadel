"use client";

import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { residentSupportApi } from "@/features/support/api/SupportApi";
import { NoticeCard } from "@/features/support/components/NoticeCard";
import { useMyNotices } from "@/features/support/hooks/useSupport";

export default function ResidentNoticesPage() {
  const notices = useMyNotices();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Notices</h1>
      {notices.error && <ErrorState error={notices.error} onRetry={notices.refetch} />}
      {notices.isLoading && <SkeletonRows rows={3} />}
      {notices.data?.length === 0 && <EmptyState title="No notices right now" body="Announcements from the estate office will appear here." />}
      <div className="space-y-3">
        {notices.data?.map((n) => <NoticeCard key={n.id} notice={n} openAttachment={residentSupportApi.attachmentLink} />)}
      </div>
    </div>
  );
}
