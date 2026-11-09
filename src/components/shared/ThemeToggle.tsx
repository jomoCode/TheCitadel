"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/utils/cn";

const ORDER = ["system", "light", "dark"] as const;
const ICONS = { system: Monitor, light: Sun, dark: Moon };
const LABELS = { system: "Theme: follow device", light: "Theme: light", dark: "Theme: dark" };

/** Cycles system → light → dark. Defaults to the device setting. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme = "system", setTheme } = useTheme();
  const mounted = useIsMounted();
  const current = (ORDER as readonly string[]).includes(theme) ? (theme as (typeof ORDER)[number]) : "system";
  const Icon = ICONS[current];

  const next = () => setTheme(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);

  return (
    <button
      type="button"
      onClick={next}
      aria-label={mounted ? LABELS[current] : "Change theme"}
      title={mounted ? LABELS[current] : undefined}
      className={cn("inline-flex size-9 items-center justify-center rounded-full transition-colors hover:text-gold", className)}
    >
      {mounted ? <Icon className="size-4" aria-hidden /> : <span className="size-4" />}
    </button>
  );
}
