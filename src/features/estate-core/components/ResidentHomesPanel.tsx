"use client";

import { ArrowRightLeft, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatLongDate } from "@/lib/utils/format";
import { useResidentActions } from "../hooks/usePeople";
import type { Account, Occupancy } from "../types";
import { HousePicker } from "./HousePicker";

type Mode = { kind: "assign" } | { kind: "move"; from: Occupancy } | { kind: "end"; occupancy: Occupancy } | null;

/** A resident's homes, current and past, with assign / move / end-stay actions. */
export function ResidentHomesPanel({ account, canManage }: { account: Account; canManage: boolean }) {
  const [mode, setMode] = useState<Mode>(null);
  const [houseId, setHouseId] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);
  const [reason, setReason] = useState("");
  const close = () => { setMode(null); setHouseId(""); setReason(""); };
  const actions = useResidentActions(account.id, close);
  const active = account.occupancies.filter((o) => o.status === "active");
  const past = account.occupancies.filter((o) => o.status === "ended");

  const confirmSheet = () => {
    if (mode?.kind === "assign") actions.assign.mutate({ house_id: houseId, is_primary: isPrimary });
    if (mode?.kind === "move") actions.move.mutate({ from_occupancy_id: mode.from.id, to_house_id: houseId, reason });
  };
  const sheetValid = houseId && (mode?.kind !== "move" || reason.trim().length >= 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Homes</h2>
        {canManage && account.status === "active" && <Button size="sm" variant="outline" onClick={() => setMode({ kind: "assign" })}><Plus className="size-4" /> Assign house</Button>}
      </div>
      {account.occupancies.length === 0 && <EmptyState title="No house assigned yet" />}
      <ul className="space-y-2.5">
        {[...active, ...past].map((o) => (
          <li key={o.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href={`/admin/houses/${o.house_id}`} className="font-medium hover:text-gold">House {o.house_identifier}</Link>
              <span className="text-sm text-muted-foreground"> · {o.estate_name}</span>
              {o.is_primary && o.status === "active" && <span className="ml-2 text-xs text-gold">Main contact</span>}
              <p className="mt-0.5 text-xs text-muted-foreground">{formatLongDate(o.start_date)} — {o.end_date ? formatLongDate(o.end_date) : "present"}</p>
            </div>
            {o.status === "active" && canManage ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setMode({ kind: "move", from: o })}><ArrowRightLeft className="size-3.5" /> Move</Button>
                <Button size="sm" variant="outline" onClick={() => setMode({ kind: "end", occupancy: o })}><LogOut className="size-3.5" /> End stay</Button>
              </div>
            ) : (
              <StatusPill status={o.status} />
            )}
          </li>
        ))}
      </ul>

      <Sheet open={mode?.kind === "assign" || mode?.kind === "move"} onOpenChange={(o) => !o && close()}
        title={mode?.kind === "move" ? `Move from house ${mode.from.house_identifier}` : "Assign a house"}
        tip={getTooltip(mode?.kind === "move" ? "admin.resident.move" : "admin.resident.primary")}
        footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
          <Button className="flex-2" disabled={!sheetValid || actions.assign.isPending || actions.move.isPending} onClick={confirmSheet}>
            {mode?.kind === "move" ? "Move resident" : "Assign"}
          </Button></>}>
        <div className="space-y-4">
          <HousePicker value={houseId} onChange={setHouseId} excludeHouseId={mode?.kind === "move" ? mode.from.house_id : undefined} idPrefix="assign" />
          {mode?.kind === "assign" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} className="size-4 accent-gold" /> Main contact for the house
              <InfoTip text={getTooltip("admin.resident.primary")} />
            </label>
          )}
          {mode?.kind === "move" && (
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason for the move</span>
              <input value={reason} onChange={(e) => setReason(e.target.value)} className={`${inputClass} mt-1.5`} placeholder="e.g. Upsized to a 4-bed" />
            </label>
          )}
        </div>
      </Sheet>

      <ConfirmDialog open={mode?.kind === "end"} onOpenChange={(o) => !o && close()} requireReason pending={actions.end.isPending}
        title={`End stay at house ${mode?.kind === "end" ? mode.occupancy.house_identifier : ""}?`} body={getTooltip("admin.resident.endStay")}
        confirmLabel="End stay" onConfirm={(r) => mode?.kind === "end" && actions.end.mutate({ occupancyId: mode.occupancy.id, reason: r })} />
    </section>
  );
}
