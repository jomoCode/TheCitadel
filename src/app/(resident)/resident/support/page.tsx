"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FilterChips } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { useResidentHome } from "@/features/resident/hooks/useResidentHome";
import { NewTicketSheet } from "@/features/support/components/NewTicketSheet";
import { useMyTickets } from "@/features/support/hooks/useSupport";
import { TICKET_STATUS_WORDS } from "@/features/support/types";
import { getTooltip } from "@/lib/tooltips/registry";

export default function ResidentSupportPage() {
  const [status, setStatus] = useState<"" | "active" | "resolved" | "closed">("active");
  const [creating, setCreating] = useState(false);
  const tickets = useMyTickets({ status: status || undefined, page_size: 50 });
  const home = useResidentHome();
  const homes = (home.data?.homes ?? []).map((h) => ({ house_id: h.house_id, house_identifier: h.house_identifier, estate_name: h.estate_name }));

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-1 font-display text-3xl">Support <InfoTip text={getTooltip("support.overview")} /></h1>
        <Button onClick={() => setCreating(true)} disabled={homes.length === 0}><Plus className="size-4" /> New request</Button>
      </div>
      {homes.length === 0 && home.data && <p className="text-sm text-muted-foreground">Your home needs to be linked to your account before you can raise requests.</p>}
      <FilterChips label="Request status" value={status} onChange={setStatus}
        options={[{ value: "active", label: "Ongoing" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }, { value: "", label: "All" }]} />
      {tickets.error && <ErrorState error={tickets.error} onRetry={tickets.refetch} />}
      {tickets.isLoading && <SkeletonRows rows={3} />}
      {tickets.data && tickets.data.items.length === 0 && (
        <EmptyState title={status === "active" ? "No ongoing requests" : "Nothing here"} body="Something not working at home? Tell us and we'll get it sorted."
          action={homes.length > 0 && <Button onClick={() => setCreating(true)}>Report a problem</Button>} />
      )}
      <ul className="space-y-2.5">
        {tickets.data?.items.map((t) => (
          <li key={t.id}>
            <Link href={`/resident/support/${t.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 active:bg-surface-muted">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{t.category_name} · updated {new Date(t.last_activity_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                <p className="mt-2 text-xs font-medium text-gold">{TICKET_STATUS_WORDS[t.status]}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <NewTicketSheet open={creating} onOpenChange={setCreating} homes={homes} />
    </div>
  );
}
