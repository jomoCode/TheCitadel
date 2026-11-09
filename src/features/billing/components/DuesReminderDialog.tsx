"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BellRing } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { formatKobo } from "@/lib/utils/money";
import type { BillAlert } from "../types";
import { BillAlerts } from "./BillAlerts";

const SEEN_KEY = "citadel.dues-reminder-seen";

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Friendly pop-up, once per visit, when bills are overdue or due soon (owner decision: reminders, no penalties). */
export function DuesReminderDialog({ alerts, outstandingKobo }: { alerts: BillAlert[]; outstandingKobo: number }) {
  const [open, setOpen] = useState(() => alerts.length > 0 && typeof window !== "undefined" && !alreadySeen());
  const close = (next: boolean) => {
    if (!next) {
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode */ }
    }
    setOpen(next);
  };
  const overdue = alerts.some((a) => a.level === "overdue");

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-6 focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          <BellRing className="size-8 text-gold" aria-hidden />
          <Dialog.Title className="mt-3 font-display text-2xl">{overdue ? "A friendly reminder" : "Bills coming up"}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            You have {formatKobo(outstandingKobo)} to pay. Paying on time keeps your estate running smoothly.
          </Dialog.Description>
          <div className="mt-4"><BillAlerts alerts={alerts} limit={3} /></div>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/resident/bills" onClick={() => close(false)} className={buttonVariants({ size: "lg" })}>View and pay</Link>
            <Dialog.Close className={buttonVariants({ variant: "outline", size: "lg" })}>Remind me later</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
