"use client";

import { useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { useEstates, useHouses } from "../hooks/useEstates";

type HousePickerProps = {
  value: string;
  onChange: (houseId: string) => void;
  excludeHouseId?: string;
  idPrefix?: string;
};

/** Two simple steps — pick the estate, then the house — instead of one huge list. Inactive houses are hidden. */
export function HousePicker({ value, onChange, excludeHouseId, idPrefix = "picker" }: HousePickerProps) {
  const [estateId, setEstateId] = useState("");
  const estates = useEstates({ page_size: 100, status: "active" });
  const houses = useHouses({ estate_id: estateId, page_size: 100 }, Boolean(estateId));
  const options = (houses.data?.items ?? []).filter((h) => h.status !== "inactive" && h.id !== excludeHouseId);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Estate</span>
        <select id={`${idPrefix}-estate`} value={estateId} onChange={(e) => { setEstateId(e.target.value); onChange(""); }} className={`${inputClass} mt-1.5`}>
          <option value="">Choose…</option>
          {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">House</span>
        <select id={`${idPrefix}-house`} value={value} onChange={(e) => onChange(e.target.value)} disabled={!estateId} className={`${inputClass} mt-1.5`}>
          <option value="">{estateId ? "Choose…" : "Pick an estate first"}</option>
          {options.map((h) => (
            <option key={h.id} value={h.id}>
              {h.identifier}{h.block ? ` · ${h.block}` : ""} — {h.status === "occupied" ? `${h.active_residents} living here` : h.status.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
