"use client";

import { useSyncExternalStore } from "react";

export const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

/**
 * Returns "desktop" or "mobile" based on the viewport.
 * On the server it returns null, so callers can render a neutral fallback and avoid layout flashes.
 */
export function useBreakpoint(): "desktop" | "mobile" | null {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile"),
    () => null,
  );
}
