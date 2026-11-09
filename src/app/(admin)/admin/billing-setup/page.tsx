"use client";

import { Pause, Play, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill, humanize } from "@/components/shared/app/StatusPill";
import { inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { BillingSettingsForm } from "@/features/billing/components/BillingSettingsForm";
import { ScheduleSheet } from "@/features/billing/components/ScheduleSheet";
import { useBillingSettings, usePaymentHeads, useSchedules, useSetupActions } from "@/features/billing/hooks/useBillingAdmin";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { formatLongDate } from "@/lib/utils/format";
import { formatKobo, parseNairaToKobo } from "@/lib/utils/money";
import { usePermission } from "@/providers/AuthProvider";

type Tab = "heads" | "schedules" | "settings";

function HeadsTab() {
  const heads = usePaymentHeads();
  const canManage = usePermission(Perm.PaymentHeadsManage);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const actions = useSetupActions(() => { setName(""); setAmount(""); });
  if (heads.error) return <ErrorState error={heads.error} onRetry={heads.refetch} />;
  if (!heads.data) return <SkeletonRows />;
  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4 sm:flex-row">
          <input aria-label="New charge type name" value={name} onChange={(e) => setName(e.target.value)} placeholder="New charge type, e.g. Gym access" className={inputClass} />
          <div className="sm:w-48"><MoneyInput aria-label="Usual amount (optional)" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Usual amount" /></div>
          <Button disabled={name.trim().length < 2 || actions.createHead.isPending}
            onClick={() => actions.createHead.mutate({ name: name.trim(), default_amount_kobo: parseNairaToKobo(amount) ?? undefined })}><Plus className="size-4" /> Add</Button>
        </div>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {heads.data.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{h.name}</p>
              <p className="truncate text-xs text-muted-foreground">{[h.default_frequency && humanize(h.default_frequency), h.default_amount_kobo && formatKobo(h.default_amount_kobo), h.description].filter(Boolean).join(" · ")}</p>
            </div>
            {canManage ? (
              <Button size="sm" variant="outline" onClick={() => actions.updateHead.mutate({ id: h.id, status: h.status === "active" ? "inactive" : "active" })}>
                {h.status === "active" ? "Switch off" : "Switch on"}
              </Button>
            ) : <StatusPill status={h.status} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchedulesTab() {
  const schedules = useSchedules();
  const canIssue = usePermission(Perm.BillsIssue);
  const actions = useSetupActions();
  const [creating, setCreating] = useState(false);
  if (schedules.error) return <ErrorState error={schedules.error} onRetry={schedules.refetch} />;
  if (!schedules.data) return <SkeletonRows />;
  return (
    <div className="space-y-4">
      {canIssue && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => actions.runSchedules.mutate(undefined)} disabled={actions.runSchedules.isPending}><RefreshCw className="size-4" /> Run due charges now</Button>
          <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New recurring charge</Button>
        </div>
      )}
      {schedules.data.length === 0 && <EmptyState title="No recurring charges yet" body={getTooltip("billing.schedules")} />}
      <ul className="grid gap-3 md:grid-cols-2">
        {schedules.data.map((s) => (
          <li key={s.id} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-display text-xl">{s.name}</p><p className="text-xs text-muted-foreground">{s.payment_head_name} · {s.estate_name ?? `${s.house_ids?.length ?? 0} houses`}</p></div>
              <StatusPill status={s.status === "paused" ? "inactive" : "active"} />
            </div>
            <p className="mt-3 text-sm">{formatKobo(s.amount_kobo)} {humanize(s.frequency).toLowerCase()} · {s.due_days} days to pay</p>
            <p className="text-xs text-muted-foreground">Next bills: {formatLongDate(s.next_run_date)} · {s.auto_issue ? "sent automatically" : "saved as drafts"}</p>
            {canIssue && (
              <Button size="sm" variant="outline" className="mt-4" onClick={() => actions.updateSchedule.mutate({ id: s.id, status: s.status === "active" ? "paused" : "active" })}>
                {s.status === "active" ? <><Pause className="size-3.5" /> Pause</> : <><Play className="size-3.5" /> Resume</>}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <ScheduleSheet open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function SettingsTab() {
  const settings = useBillingSettings();
  const canEdit = usePermission(Perm.SettingsManage);
  if (settings.error) return <ErrorState error={settings.error} onRetry={settings.refetch} />;
  if (!settings.data) return <SkeletonRows />;
  return <BillingSettingsForm key={JSON.stringify(settings.data)} settings={settings.data} canEdit={canEdit} />;
}

const TABS: { id: Tab; label: string; tip: string }[] = [
  { id: "heads", label: "Charge types", tip: "billing.paymentHeads" },
  { id: "schedules", label: "Recurring charges", tip: "billing.schedules" },
  { id: "settings", label: "Settings", tip: "billing.fees" },
];

export default function BillingSetupPage() {
  const [tab, setTab] = useState<Tab>("heads");
  return (
    <div className="space-y-6">
      <PageHeader title="Billing setup" description="What you charge for, automatic recurring bills and payment rules." />
      <div role="tablist" className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)}
            className={cn("flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-sm", tab === t.id ? "bg-foreground text-background" : "border border-border text-muted-foreground")}>
            {t.label}
          </button>
        ))}
        <InfoTip text={getTooltip(TABS.find((t) => t.id === tab)!.tip)} />
      </div>
      {tab === "heads" && <HeadsTab />}
      {tab === "schedules" && <SchedulesTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}
