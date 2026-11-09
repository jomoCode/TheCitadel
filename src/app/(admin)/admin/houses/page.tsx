"use client";

import { Plus } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { HouseFormSheet } from "@/features/estate-core/components/HouseFormSheet";
import { HouseList } from "@/features/estate-core/components/HouseList";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const FILTER_KEYS = ["status"] as const;

function HousesScreen() {
  const list = useListState(FILTER_KEYS);
  const canManage = usePermission(Perm.HousesManage);
  const addButton = canManage && <Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New house</Button>;

  return (
    <div className="space-y-6">
      <PageHeader title="Houses" tip={getTooltip("admin.houses")} description="Every home across your estates." actions={addButton} />
      <HouseList q={list.q} page={list.page} status={list.filters.status} onChange={list.set} emptyAction={addButton} />
      <HouseFormSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} />
    </div>
  );
}

export default function HousesPage() {
  return <Suspense><HousesScreen /></Suspense>;
}
