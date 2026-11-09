"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { useHouseLifecycle, useUpdateHouse } from "../hooks/useEstates";
import type { House } from "../types";

type Pending = "deactivate" | "reactivate" | "delete" | null;

/** Status changes and lifecycle actions for one house, each with a plain-language explanation. */
export function HouseActions({ house }: { house: House }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const close = () => setPending(null);
  const update = useUpdateHouse(house.id);
  const lifecycle = useHouseLifecycle(house.id, close);
  const remove = { ...lifecycle.remove, mutate: () => lifecycle.remove.mutate(undefined, { onSuccess: () => router.replace("/admin/houses") }) };
  const inactive = house.status === "inactive";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
      {!inactive && (
        <label className="block">
          <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status <InfoTip text={getTooltip(`house.status.${house.status}`) || getTooltip("house.status.occupied")} />
          </span>
          <select
            aria-label="House status"
            value={house.status === "occupied" ? "" : house.status}
            onChange={(e) => e.target.value && update.mutate({ status: e.target.value as "available" | "reserved" | "under_maintenance" })}
            className={`${inputClass} mt-1.5`}
          >
            {house.status === "occupied" && <option value="">Occupied (set automatically)</option>}
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="under_maintenance">Under maintenance</option>
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {inactive ? (
          <Button variant="outline" size="sm" onClick={() => setPending("reactivate")}>Reactivate</Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setPending("deactivate")}>Deactivate</Button>
        )}
        <Button variant="outline" size="sm" className="border-danger text-danger hover:bg-danger hover:text-white" onClick={() => setPending("delete")}>Delete</Button>
        <InfoTip text={getTooltip("admin.house.delete")} />
      </div>

      <ConfirmDialog open={pending === "deactivate"} onOpenChange={(o) => !o && close()} requireReason pending={lifecycle.deactivate.isPending}
        title={`Deactivate house ${house.identifier}?`} body={getTooltip("admin.house.deactivate")} confirmLabel="Deactivate"
        onConfirm={(reason) => lifecycle.deactivate.mutate(reason)} />
      <ConfirmDialog open={pending === "reactivate"} onOpenChange={(o) => !o && close()} pending={lifecycle.reactivate.isPending}
        title={`Reactivate house ${house.identifier}?`} body="The house will become available for residents again." confirmLabel="Reactivate"
        onConfirm={() => lifecycle.reactivate.mutate(undefined)} />
      <ConfirmDialog open={pending === "delete"} onOpenChange={(o) => !o && close()} tone="danger" pending={remove.isPending}
        title={`Delete house ${house.identifier}?`} body="This permanently removes a house that has never had residents. Houses with history can only be deactivated."
        confirmLabel="Delete house" onConfirm={() => remove.mutate()} />
    </div>
  );
}
