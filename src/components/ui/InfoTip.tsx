"use client";

import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { getTooltip, type TooltipKey } from "@/lib/tooltips/registry";

type InfoTipProps = {
  /** Key into the plain-language tooltip registry. */
  tip?: TooltipKey;
  /** Inline text, for one-off tips that do not belong in the registry. */
  text?: string;
  label?: string;
  className?: string;
};

/**
 * A small ⓘ icon that explains a feature in everyday language.
 * Opens on hover for mouse users and on tap for touch users (a hover-only tooltip is invisible on phones).
 */
export function InfoTip({ tip, text, label = "What is this?", className }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const content = text ?? (tip ? getTooltip(tip) : "");
  if (!content) return null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={label}
        onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(event) => event.pointerType === "mouse" && setOpen(false)}
        onClick={(event) => {
          // A click/tap always opens (never toggles shut a tip that hover just opened).
          // preventDefault stops Radix's built-in toggle; outside tap or Escape still closes it.
          event.preventDefault();
          setOpen(true);
        }}
        className={cn(
          "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-gold",
          className,
        )}
      >
        <Info className="size-3.5" aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-50 max-w-[18rem] rounded-brand border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-foreground shadow-lg"
        >
          {content}
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
