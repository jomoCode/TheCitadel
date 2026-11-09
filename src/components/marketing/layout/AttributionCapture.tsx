"use client";

import { useEffect } from "react";
import { attributionTracker } from "@/features/marketing/services/AttributionTracker";

/** Records the visitor's first landing page and campaign tags once per session. Renders nothing. */
export function AttributionCapture() {
  useEffect(() => {
    attributionTracker.capture(window.location.href, document.referrer);
  }, []);
  return null;
}
