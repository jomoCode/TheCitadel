"use client";

import { useEffect } from "react";
import { track } from "@/features/analytics";

/** Records a "property_viewed" event once per page view (Insights "top properties"). */
export function PropertyViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track({ name: "property_viewed", tag: "property_page", meta: { property: slug } });
  }, [slug]);
  return null;
}
