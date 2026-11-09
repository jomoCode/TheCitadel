"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { inputClass } from "./FormField";

type MoneyInputProps = Omit<React.ComponentProps<"input">, "type" | "inputMode"> & { invalid?: boolean };

/** Naira amount input: ₦ prefix, decimal keypad on phones. Parse with parseNairaToKobo() before sending. */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput({ className, invalid, ...props }, ref) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>₦</span>
      <input ref={ref} type="text" inputMode="decimal" autoComplete="off" aria-invalid={invalid}
        className={cn(inputClass, "pl-8 tabular-nums", className)} {...props} />
    </div>
  );
});
