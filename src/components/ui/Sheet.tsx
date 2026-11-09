"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { InfoTip } from "@/components/ui/InfoTip";
import { cn } from "@/lib/utils/cn";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tip?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/**
 * Form container that feels native on each device:
 * phones → a sheet that slides up from the bottom (thumb reach, drag handle);
 * desktop → a panel that slides in from the right.
 */
export function Sheet({ open, onOpenChange, title, description, tip, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-background shadow-2xl focus:outline-none",
            "inset-x-0 bottom-0 max-h-[92svh] rounded-t-2xl",
            "lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[30rem] lg:rounded-none lg:border-l lg:border-border",
          )}
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden />
          <header className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 lg:px-7 lg:pt-7">
            <div>
              <Dialog.Title className="flex items-center gap-1 font-display text-2xl">
                {title}
                {tip && <InfoTip text={tip} />}
              </Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>}
            </div>
            <Dialog.Close aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted">
              <X className="size-5" />
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-7">{children}</div>
          {footer && <footer className="safe-bottom flex gap-3 border-t border-border px-5 py-4 lg:px-7">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
