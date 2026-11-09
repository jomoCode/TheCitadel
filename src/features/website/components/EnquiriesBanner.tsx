"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";
import { useEnquiryCounts } from "../hooks/useWebsite";

/** Overview nudge: how many website enquiries still need someone to deal with them. Renders nothing when all are handled. */
export function EnquiriesBanner() {
  const counts = useEnquiryCounts();
  if (!counts.data?.open) return null;
  const { open, today } = counts.data;
  return (
    <Link href="/admin/enquiries" className="flex items-center gap-3 rounded-lg border border-gold/40 bg-gold-soft p-4 text-sm hover:border-gold">
      <Inbox className="size-5 shrink-0 text-gold" aria-hidden />
      <span className="flex-1"><strong>{open} website {open === 1 ? "enquiry" : "enquiries"}</strong> to handle{today ? ` · ${today} new today` : ""}</span>
      <span className="text-gold">Open</span>
    </Link>
  );
}
