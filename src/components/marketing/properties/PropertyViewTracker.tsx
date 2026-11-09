"use client";

import { useEffect } from "react";
import { analyticsTracker } from "@/features/marketing/services/AnalyticsTracker";

/** Records a "property_viewed" business event once per page view. */
export function PropertyViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    analyticsTracker.track("property_viewed", { property: slug });
  }, [slug]);
  return null;
}
