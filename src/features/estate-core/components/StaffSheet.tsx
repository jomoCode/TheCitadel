"use client";

import { useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { useCreateStaff, useRoles, useSetRoles } from "../hooks/usePeople";
import type { Account } from "../types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; member?: Account };

/** Add a staff member (with roles), or change an existing member's roles. Re-mounted on every open. */
export function StaffSheet(props: Props) {
  return <StaffSheetBody key={props.open ? (props.member?.id ?? "new") : "closed"} {...props} />;
}

function StaffSheetBody({ open, onOpenChange, member }: Props) {
  const close = () => onOpenChange(false);
  const roles = useRoles(open);
  const create = useCreateStaff(close);
  const setRoles = useSetRoles(close);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", temporary_password: "" });
  const [useTempPassword, setUseTempPassword] = useState(false);
  // null = untouched → show the member's current roles once the role list has loaded
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const staffRoles = (roles.data ?? []).filter((r) => r.key !== "resident");
  const roleIds = picked ?? new Set(staffRoles.filter((r) => member?.roles.includes(r.key)).map((r) => r.id));

  const toggle = (id: string) => setPicked(() => { const n = new Set(roleIds); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const passwordTooShort = useTempPassword && form.temporary_password.length < 10;
  const valid = roleIds.size > 0 && (member || (form.full_name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && !passwordTooShort));
  const save = () =>
    member
      ? setRoles.mutate({ userId: member.id, roleIds: [...roleIds] })
      : create.mutate({
          full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, role_ids: [...roleIds],
          temporary_password: useTempPassword ? form.temporary_password : null,
        });

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={member ? `Roles for ${member.full_name}` : "Add team member"} tip={getTooltip("admin.staff")}
      description={member ? getTooltip("admin.permissionsApply") : useTempPassword ? "They'll sign in with the temporary password you set." : "They'll receive an email invitation to choose a password."}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button><Button className="flex-2" disabled={!valid || create.isPending || setRoles.isPending} onClick={save}>{member ? "Save roles" : useTempPassword ? "Create account" : "Send invitation"}</Button></>}>
      <div className="space-y-4">
        {!member && (
          <>
            <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Full name</span>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
            <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
            <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Phone (optional)</span>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
            <div className="rounded-lg bg-surface-muted p-4 text-sm">
              <p>How will they sign in?</p>
              <label className="mt-3 flex items-center gap-2"><input type="radio" name="staff-signin" checked={!useTempPassword} onChange={() => setUseTempPassword(false)} className="accent-gold" /> Email them an invitation (recommended)</label>
              <label className="mt-2 flex items-center gap-2"><input type="radio" name="staff-signin" checked={useTempPassword} onChange={() => setUseTempPassword(true)} className="accent-gold" /> Set a temporary password <InfoTip text={getTooltip("admin.staff.tempPassword")} /></label>
              {useTempPassword && (
                <label className="mt-3 block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Temporary password</span>
                  <input type="text" value={form.temporary_password} onChange={(e) => setForm({ ...form, temporary_password: e.target.value })} autoComplete="off" className={`${inputClass} mt-1.5`} />
                  {form.temporary_password && passwordTooShort && <span className="mt-1 block text-xs text-danger" role="alert">At least 10 characters</span>}
                </label>
              )}
            </div>
          </>
        )}
        <fieldset>
          <legend className="text-eyebrow mb-2 flex items-center gap-1 text-gold">Roles <InfoTip text={getTooltip("admin.roles")} /></legend>
          <ul className="space-y-1">
            {staffRoles.map((r) => (
              <li key={r.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-brand p-2 hover:bg-surface-muted">
                  <input type="checkbox" checked={roleIds.has(r.id)} onChange={() => toggle(r.id)} className="mt-0.5 size-4 accent-gold" />
                  <span><span className="text-sm font-medium">{r.name}</span>{r.description && <span className="block text-xs text-muted-foreground">{r.description}</span>}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </Sheet>
  );
}
