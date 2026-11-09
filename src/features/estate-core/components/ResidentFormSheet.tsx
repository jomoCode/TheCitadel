"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { useCreateResident } from "../hooks/usePeople";
import { HousePicker } from "./HousePicker";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter the resident's full name").max(120),
  email: z.string().trim().email("Enter a valid email — the invitation is sent here"),
  phone: z.union([z.literal(""), z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number")]),
  house_id: z.string(),
  is_primary: z.boolean(),
  temporary_password: z.union([z.literal(""), z.string().min(10, "At least 10 characters")]),
});
type Values = z.infer<typeof schema>;

type Props = { open: boolean; onOpenChange: (open: boolean) => void; defaultHouseId?: string };

/** Creates the resident's login (by email invitation by default) and optionally assigns their house in one go. */
export function ResidentFormSheet(props: Props) {
  return <ResidentFormBody key={props.open ? `open-${props.defaultHouseId ?? ""}` : "closed"} {...props} />;
}

function ResidentFormBody({ open, onOpenChange, defaultHouseId }: Props) {
  const close = () => onOpenChange(false);
  const create = useCreateResident(close);
  const [useTempPassword, setUseTempPassword] = useState(false);
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", phone: "", house_id: defaultHouseId ?? "", is_primary: true, temporary_password: "" },
  });

  const submit = handleSubmit((v) =>
    create.mutate({
      full_name: v.full_name, email: v.email, phone: v.phone || null, house_id: v.house_id || null, is_primary: v.is_primary,
      temporary_password: useTempPassword && v.temporary_password ? v.temporary_password : null,
    }),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New resident" tip={getTooltip("admin.residents")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button><Button className="flex-2" onClick={submit} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create resident"}</Button></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="resident-name" label="Full name" error={errors.full_name?.message}>
          <input id="resident-name" {...register("full_name")} autoComplete="off" className={inputClass} />
        </FormField>
        <FormField id="resident-email" label="Email" error={errors.email?.message}>
          <input id="resident-email" type="email" inputMode="email" {...register("email")} autoComplete="off" className={inputClass} />
        </FormField>
        <FormField id="resident-phone" label="Phone (optional)" error={errors.phone?.message}>
          <input id="resident-phone" type="tel" inputMode="tel" {...register("phone")} placeholder="+234" className={inputClass} />
        </FormField>

        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">House (optional)</legend>
          {defaultHouseId ? (
            <p className="text-sm text-muted-foreground">This resident will be assigned to the house you came from.</p>
          ) : (
            <Controller control={control} name="house_id" render={({ field }) => <HousePicker value={field.value} onChange={field.onChange} idPrefix="resident" />} />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("is_primary")} className="size-4 accent-gold" /> Main contact for the house
            <InfoTip text={getTooltip("admin.resident.primary")} />
          </label>
        </fieldset>

        <div className="rounded-lg bg-surface-muted p-4 text-sm">
          <p className="flex items-center gap-1">How will they sign in? <InfoTip text={getTooltip("admin.resident.invite")} /></p>
          <label className="mt-3 flex items-center gap-2"><input type="radio" checked={!useTempPassword} onChange={() => setUseTempPassword(false)} className="accent-gold" /> Email them an invitation (recommended)</label>
          <label className="mt-2 flex items-center gap-2"><input type="radio" checked={useTempPassword} onChange={() => setUseTempPassword(true)} className="accent-gold" /> Set a temporary password <InfoTip text={getTooltip("admin.resident.tempPassword")} /></label>
          {useTempPassword && (
            <FormField id="resident-temp" label="Temporary password" error={errors.temporary_password?.message} className="mt-3">
              <input id="resident-temp" type="text" {...register("temporary_password")} autoComplete="off" className={inputClass} />
            </FormField>
          )}
        </div>
      </form>
    </Sheet>
  );
}
