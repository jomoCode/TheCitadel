"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { analyticsTracker } from "@/features/marketing/services/AnalyticsTracker";

/** Records one first-party page view per page visited (for the Insights dashboard). No cookies, no personal data. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) analyticsTracker.track("page_viewed", { path: pathname });
  }, [pathname]);
  return null;
}
