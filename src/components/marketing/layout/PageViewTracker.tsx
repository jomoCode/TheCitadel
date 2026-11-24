"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/features/analytics";

/** Records one page view per page visited (for the Insights dashboard). No cookies, no personal data. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track({ name: "page_viewed", tag: "page" });
  }, [pathname]);
  return null;
}
