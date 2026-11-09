"use client";

import { PageHeader } from "@/components/shared/app/PageHeader";
import { ActivityTimeline } from "@/features/estate-core/components/ActivityTimeline";
import { getTooltip } from "@/lib/tooltips/registry";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Activity log" tip={getTooltip("admin.activityLog")} description="Every important change across the system, newest first." />
      <ActivityTimeline />
    </div>
  );
}
