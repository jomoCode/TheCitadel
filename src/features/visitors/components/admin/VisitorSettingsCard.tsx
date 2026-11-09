"use client";

import { SkeletonRows } from "@/components/shared/app/States";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";
import { useEstateVisitorSettings, useVisitorAdminActions } from "../../hooks/useVisitors";

const RULES = [
  { key: "walkin_requires_approval", label: "Visitors without a pass need the resident's OK", tip: "visitors.walkinApproval" },
  { key: "invite_requires_approval", label: "Residents confirm when an invited guest arrives", tip: "visitors.inviteApproval" },
] as const;

/** Per-estate visitor rules, shown on the estate page. Read-only for staff without estates.manage. */
export function VisitorSettingsCard({ estateId }: { estateId: string }) {
  const settings = useEstateVisitorSettings(estateId);
  const canManage = usePermission(Perm.EstatesManage);
  const { updateSettings } = useVisitorAdminActions();
  if (!settings.data) return <SkeletonRows rows={2} />;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl">Visitor rules</h2>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {RULES.map((r) => (
          <li key={r.key}>
            <label className="flex items-center justify-between gap-4 p-4 text-sm">
              <span className="flex items-center gap-1">{r.label} <InfoTip text={getTooltip(r.tip)} /></span>
              <input type="checkbox" role="switch" aria-label={r.label} className="size-5 shrink-0 accent-gold" checked={settings.data[r.key]}
                disabled={!canManage || updateSettings.isPending}
                onChange={(e) => updateSettings.mutate({ estateId, [r.key]: e.target.checked })} />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
