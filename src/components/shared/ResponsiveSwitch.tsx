"use client";

import { useBreakpoint } from "@/hooks/useBreakpoint";

type ResponsiveSwitchProps = {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  /** Shown during server render, before the viewport is known. */
  fallback?: React.ReactNode;
};

/**
 * Renders a genuinely different component tree for phones and for desktops,
 * instead of squeezing the desktop layout onto a small screen.
 */
export function ResponsiveSwitch({ mobile, desktop, fallback = null }: ResponsiveSwitchProps) {
  const breakpoint = useBreakpoint();
  if (breakpoint === null) return <>{fallback}</>;
  return <>{breakpoint === "desktop" ? desktop : mobile}</>;
}
