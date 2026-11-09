"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { useCreateHouse, useEstates, useUpdateHouse } from "../hooks/useEstates";
import type { House } from "../types";

const optionalInt = z.union([z.literal(""), z.coerce.number().int().min(0).max(100)]).optional();
const schema = z.object({
  estate_id: z.string().min(1, "Choose the estate this house belongs to"),
  identifier: z.string().trim().min(1, "Enter the house number or name").max(60),
  location: z.string().trim().min(2, "Describe where the house is in the estate").max(200),
  block: z.string().trim().max(60).optional(),
  category: z.string().trim().max(80).optional(),
  rooms: optionalInt,
  bedrooms: optionalInt,
  description: z.string().trim().max(2000).optional(),
});
type Values = z.input<typeof schema>;

const toNumber = (v: unknown) => (v === "" || v === undefined ? null : Number(v));

type Props = { open: boolean; onOpenChange: (open: boolean) => void; house?: House; defaultEstateId?: string };

export function HouseFormSheet({ open, onOpenChange, house, defaultEstateId }: Props) {
  const close = () => onOpenChange(false);
  const create = useCreateHouse(close);
  const update = useUpdateHouse(house?.id ?? "", close);
  const mutation = house ? update : create;
  const estates = useEstates({ page_size: 100, status: "active" });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset({
      estate_id: house?.estate_id ?? defaultEstateId ?? "",
      identifier: house?.identifier ?? "",
      location: house?.location ?? "",
      block: house?.block ?? "",
      category: house?.category ?? "",
      rooms: house?.rooms ?? "",
      bedrooms: house?.bedrooms ?? "",
      description: house?.description ?? "",
    });
  }, [open, house, defaultEstateId, reset]);

  const submit = handleSubmit((v) => {
    const body = {
      identifier: v.identifier, location: v.location, block: v.block || null, category: v.category || null,
      rooms: toNumber(v.rooms), bedrooms: toNumber(v.bedrooms), description: v.description || null,
    };
    if (house) update.mutate(body);
    else create.mutate({ ...body, estate_id: v.estate_id });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={house ? `Edit house ${house.identifier}` : "New house"} tip={getTooltip("admin.houses")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button><Button className="flex-2" onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : house ? "Save changes" : "Add house"}</Button></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="house-estate" label="Estate" error={errors.estate_id?.message}>
          <select id="house-estate" {...register("estate_id")} disabled={Boolean(house)} className={inputClass}>
            <option value="">Choose an estate…</option>
            {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="house-identifier" label="House no. / name" tip={getTooltip("admin.house.identifier")} error={errors.identifier?.message}>
            <input id="house-identifier" {...register("identifier")} className={inputClass} placeholder="A12" />
          </FormField>
          <FormField id="house-block" label="Block (optional)">
            <input id="house-block" {...register("block")} className={inputClass} placeholder="Block A" />
          </FormField>
        </div>
        <FormField id="house-location" label="Location in the estate" tip={getTooltip("admin.house.location")} error={errors.location?.message}>
          <input id="house-location" {...register("location")} className={inputClass} placeholder="North wing, by the clubhouse" />
        </FormField>
        <FormField id="house-category" label="Category (optional)" tip={getTooltip("admin.house.category")}>
          <input id="house-category" {...register("category")} className={inputClass} placeholder="4-bed terrace" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="house-rooms" label="Rooms" error={errors.rooms?.message}>
            <input id="house-rooms" type="number" inputMode="numeric" min={0} {...register("rooms")} className={inputClass} />
          </FormField>
          <FormField id="house-bedrooms" label="Bedrooms" error={errors.bedrooms?.message}>
            <input id="house-bedrooms" type="number" inputMode="numeric" min={0} {...register("bedrooms")} className={inputClass} />
          </FormField>
        </div>
        <FormField id="house-description" label="Notes (optional)">
          <textarea id="house-description" rows={3} {...register("description")} className={inputClass} />
        </FormField>
      </form>
    </Sheet>
  );
}
