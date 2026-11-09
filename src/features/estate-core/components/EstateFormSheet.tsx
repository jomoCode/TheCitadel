"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { useCreateEstate, useUpdateEstate } from "../hooks/useEstates";
import type { Estate } from "../types";

const schema = z.object({
  name: z.string().trim().min(2, "Give the estate a name (at least 2 characters)").max(120),
  location: z.string().trim().max(200).optional(),
  address: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
});
type Values = z.infer<typeof schema>;

type Props = { open: boolean; onOpenChange: (open: boolean) => void; estate?: Estate };

/** Create a new estate, or edit one when `estate` is passed. Only the name is required. */
export function EstateFormSheet({ open, onOpenChange, estate }: Props) {
  const close = () => onOpenChange(false);
  const create = useCreateEstate(close);
  const update = useUpdateEstate(estate?.id ?? "", close);
  const mutation = estate ? update : create;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ name: estate?.name ?? "", location: estate?.location ?? "", address: estate?.address ?? "", description: estate?.description ?? "" });
  }, [open, estate, reset]);

  const submit = handleSubmit((v) => mutation.mutate({ name: v.name, location: v.location || null, address: v.address || null, description: v.description || null }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={estate ? "Edit estate" : "New estate"} tip={getTooltip("admin.estates")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button><Button className="flex-2" onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : estate ? "Save changes" : "Create estate"}</Button></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="estate-name" label="Estate name" tip={getTooltip("admin.estate.name")} error={errors.name?.message}>
          <input id="estate-name" {...register("name")} className={inputClass} placeholder="e.g. The Citadel" />
        </FormField>
        <FormField id="estate-location" label="Location (optional)">
          <input id="estate-location" {...register("location")} className={inputClass} placeholder="e.g. Asokoro, Abuja" />
        </FormField>
        <FormField id="estate-address" label="Address (optional)">
          <input id="estate-address" {...register("address")} className={inputClass} />
        </FormField>
        <FormField id="estate-description" label="Description (optional)">
          <textarea id="estate-description" rows={4} {...register("description")} className={inputClass} />
        </FormField>
      </form>
    </Sheet>
  );
}
