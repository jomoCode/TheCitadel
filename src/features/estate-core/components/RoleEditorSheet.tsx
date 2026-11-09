"use client";

import { useMemo, useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermissionCatalog, useRoleActions } from "../hooks/usePeople";
import type { Role } from "../types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; role?: Role };

/** Create or edit a role. Re-mounted on every open so the form always starts from the role's saved values. */
export function RoleEditorSheet(props: Props) {
  return <RoleEditorBody key={props.open ? (props.role?.id ?? "new") : "closed"} {...props} />;
}

function RoleEditorBody({ open, onOpenChange, role }: Props) {
  const close = () => onOpenChange(false);
  const catalog = usePermissionCatalog();
  const actions = useRoleActions(close);
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(role?.permissions ?? []));
  const locked = role?.key === "administrator";
  const catalogData = catalog.data;

  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<typeof catalogData>>();
    for (const p of catalogData ?? []) map.set(p.group, [...(map.get(p.group) ?? []), p]);
    return [...map.entries()];
  }, [catalogData]);

  const toggle = (code: string) => setSelected((s) => { const n = new Set(s); if (n.has(code)) n.delete(code); else n.add(code); return n; });
  const save = () => {
    const permissions = [...selected];
    if (role) actions.update.mutate({ id: role.id, ...(role.is_system ? {} : { name }), description, ...(locked ? {} : { permissions }) });
    else actions.create.mutate({ name, description, permissions });
  };
  const pending = actions.create.isPending || actions.update.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={role ? `Edit ${role.name}` : "New role"} tip={getTooltip("admin.roles")}
      description={getTooltip("admin.permissionsApply")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button><Button className="flex-2" disabled={name.trim().length < 2 || pending} onClick={save}>{pending ? "Saving…" : "Save role"}</Button></>}>
      <div className="space-y-5">
        <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role name</span>
          <input value={name} disabled={role?.is_system} onChange={(e) => setName(e.target.value)} placeholder="e.g. Accountant" className={`${inputClass} mt-1.5`} /></label>
        <label className="block"><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">What is this role for? (optional)</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} mt-1.5`} /></label>
        {locked && <p className="rounded-brand bg-gold-soft p-3 text-sm">{getTooltip("admin.role.system")}</p>}
        {groups.map(([group, perms]) => (
          <fieldset key={group} disabled={locked}>
            <legend className="text-eyebrow mb-2 text-gold">{group}</legend>
            <ul className="space-y-1">
              {perms.map((p) => (
                <li key={p.code}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-brand p-2 hover:bg-surface-muted">
                    <input type="checkbox" checked={selected.has(p.code)} onChange={() => toggle(p.code)} className="mt-0.5 size-4 shrink-0 accent-gold" />
                    <span className="text-sm">{p.description}</span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
    </Sheet>
  );
}
