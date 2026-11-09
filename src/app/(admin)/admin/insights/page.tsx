"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { FilterChips } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { StatCard } from "@/components/shared/app/StatCard";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { InfoTip } from "@/components/ui/InfoTip";
import { DailyColumns, RankedBars } from "@/features/content/components/InsightsCharts";
import { useInsights } from "@/features/content/hooks/useContent";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { getTooltip } from "@/lib/tooltips/registry";

const RANGES = [{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }];
const FILTER_KEYS = ["days"] as const;

function Trend({ now, before }: { now: number; before: number }) {
  if (!before && !now) return null;
  const up = now >= before;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Icon className="size-3" aria-hidden />{before} the period before</span>;
}

function InsightsScreen() {
  const list = useListState(FILTER_KEYS);
  const days = Number(list.filters.days || 30);
  const query = useInsights(days);
  const d = query.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Insights" tip={getTooltip("insights.overview")} description="How people find and use your website."
        actions={<FilterChips label="Period" options={RANGES} value={String(days)} onChange={(v) => list.set({ days: v === "30" ? null : v })} />} />
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {!d && query.isLoading && <SkeletonRows rows={4} />}
      {d && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Visitors" value={d.visitors.toLocaleString()} tip={getTooltip("insights.visitors")} hint={`${d.page_views.toLocaleString()} pages viewed`} />
            <StatCard label="Listing views" value={d.property_views.toLocaleString()} />
            <StatCard label="Enquiries" value={d.enquiries} href="/admin/enquiries?handled=all" />
            <StatCard label="Enquiry rate" value={`${d.enquiry_rate}%`} tip={getTooltip("insights.rate")} />
          </div>
          <p className="-mt-2 text-xs"><Trend now={d.enquiries} before={d.previous_enquiries} /></p>
          <div className="grid gap-4 lg:grid-cols-2">
            <DailyColumns title="Visitors per day" points={d.daily} field="visitors" />
            <DailyColumns title="Enquiries per day" points={d.daily} field="enquiries" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RankedBars title="Where enquiries came from" items={d.enquiries_by_source} empty="No enquiries in this period." tip={<InfoTip text={getTooltip("insights.source")} />} />
            <RankedBars title="What people asked about" items={d.enquiries_by_type} empty="No enquiries in this period." />
            <RankedBars title="Enquiries per listing" items={d.enquiries_by_property} empty="No listing enquiries in this period." />
            <RankedBars title="Most viewed listings" items={d.top_properties} empty="No listing views yet." />
            <RankedBars title="Most visited pages" items={d.top_pages} empty="No page views yet." />
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminInsightsPage() {
  return <Suspense><InsightsScreen /></Suspense>;
}
