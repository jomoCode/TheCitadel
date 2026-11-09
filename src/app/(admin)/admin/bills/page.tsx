"use client";

import { Plus, Send } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { BillBatchSheet } from "@/features/billing/components/BillBatchSheet";
import { BillList } from "@/features/billing/components/BillList";
import { useBillActions, useBills } from "@/features/billing/hooks/useBillingAdmin";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const FILTER_KEYS = ["status", "estate_id"] as const;

function IssueDraftsButton() {
  const drafts = useBills({ status: "draft", page_size: 100 });
  const { issue } = useBillActions();
  const ids = drafts.data?.items.map((b) => b.id) ?? [];
  if (ids.length === 0) return null;
  return (
    <Button variant="outline" onClick={() => issue.mutate(ids)} disabled={issue.isPending}>
      <Send className="size-4" /> Send {ids.length} draft{ids.length === 1 ? "" : "s"}
    </Button>
  );
}

function BillsScreen() {
  const list = useListState(FILTER_KEYS);
  const canIssue = usePermission(Perm.BillsIssue);
  const add = canIssue && <Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> Create bills</Button>;

  return (
    <div className="space-y-6">
      <PageHeader title="Bills" tip={getTooltip("billing.bills")} description="Charges sent to houses, and what is still owed."
        actions={<>{canIssue && list.filters.status === "draft" && <IssueDraftsButton />}{add}</>} />
      <BillList q={list.q} page={list.page} status={list.filters.status} estateId={list.filters.estate_id || undefined} onChange={list.set} emptyAction={add} />
      <BillBatchSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} defaultEstateId={list.filters.estate_id || undefined} />
    </div>
  );
}

export default function BillsPage() {
  return <Suspense><BillsScreen /></Suspense>;
}
