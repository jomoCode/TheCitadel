"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only in the browser after hydration — guards UI that depends on client-only state (theme, viewport). */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
