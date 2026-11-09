"use client";

import { KeyRound, Power } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { useResidentActions } from "../hooks/usePeople";
import type { Account } from "../types";

/** Deactivate / reactivate sign-in and send a password reset email. */
export function AccountActions({ account }: { account: Account }) {
  const [confirm, setConfirm] = useState<"status" | "reset" | null>(null);
  const actions = useResidentActions(account.id, () => setConfirm(null));
  const active = account.status === "active";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setConfirm("reset")}><KeyRound className="size-3.5" /> Send password reset</Button>
      <InfoTip text={getTooltip("admin.resident.reset")} />
      <Button size="sm" variant="outline" className={active ? "border-danger text-danger hover:bg-danger hover:text-white" : undefined} onClick={() => setConfirm("status")}>
        <Power className="size-3.5" /> {active ? "Deactivate account" : "Reactivate account"}
      </Button>
      <InfoTip text={getTooltip("admin.resident.deactivate")} />

      <ConfirmDialog open={confirm === "status"} onOpenChange={(o) => !o && setConfirm(null)} requireReason tone={active ? "danger" : "default"}
        pending={actions.setActive.isPending}
        title={active ? `Deactivate ${account.full_name}?` : `Reactivate ${account.full_name}?`}
        body={active ? "They will no longer be able to sign in. Their homes, payments and history are kept." : "They will be able to sign in again with their existing password."}
        confirmLabel={active ? "Deactivate" : "Reactivate"}
        onConfirm={(reason) => actions.setActive.mutate({ active: !active, reason })} />
      <ConfirmDialog open={confirm === "reset"} onOpenChange={(o) => !o && setConfirm(null)} pending={actions.reset.isPending}
        title="Send a password reset email?" body={`We'll email ${account.email} a secure link to choose a new password.`}
        confirmLabel="Send email" onConfirm={() => actions.reset.mutate(undefined, { onSuccess: () => setConfirm(null) })} />
    </div>
  );
}
