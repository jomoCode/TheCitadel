"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { citadel } from "@/content/marketing/citadel";
import { analyticsTracker } from "@/features/marketing/services/AnalyticsTracker";
import { cn } from "@/lib/utils/cn";

type BrochureDownloadProps = {
  /** Listing the download sits under; recorded with the "brochure_downloaded" event. */
  propertySlug: string;
  variant?: "outline" | "gold" | "ghostLight";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Downloads The Citadel's profile brochure (PDF) and records a "brochure_downloaded" business event. */
export function BrochureDownload({ propertySlug, variant = "outline", size = "md", className }: BrochureDownloadProps) {
  const { href, fileName, label, meta } = citadel.brochure;
  return (
    <a
      href={href}
      download={fileName}
      onClick={() => analyticsTracker.track("brochure_downloaded", { property: propertySlug })}
      className={cn(buttonVariants({ variant, size }), "relative z-10", className)}
    >
      <Download className="size-4" aria-hidden />
      {label}
      <span className="sr-only"> ({meta})</span>
    </a>
  );
}
