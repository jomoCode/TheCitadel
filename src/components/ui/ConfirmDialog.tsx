"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  /** Sensitive actions ask "why?" — the answer is saved in the activity log. */
  requireReason?: boolean;
  pending?: boolean;
  onConfirm: (reason: string) => void;
};

export function ConfirmDialog({ open, onOpenChange, title, body, confirmLabel, tone = "default", requireReason, pending, onConfirm }: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const valid = !requireReason || reason.trim().length >= 3;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) setReason(""); onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-6 shadow-2xl focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[28rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg">
          <Dialog.Title className="font-display text-2xl">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">{body}</Dialog.Description>
          {requireReason && (
            <label className="mt-5 block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason (saved in the activity log)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={`${inputClass} mt-1.5`} />
            </label>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
            <Button
              className={tone === "danger" ? "bg-danger text-white hover:opacity-90" : undefined}
              disabled={!valid || pending}
              onClick={() => onConfirm(reason.trim())}
            >
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
