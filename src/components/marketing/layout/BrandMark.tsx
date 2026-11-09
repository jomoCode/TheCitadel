import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Text logo placeholder until the client supplies brand assets (PRD §21.1). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Citadel home" className={cn("group flex flex-col items-center leading-none", className)}>
      <span className="font-display text-2xl tracking-[0.08em]">C</span>
      <span className="mt-1 font-label text-[0.55rem] tracking-[0.5em]">CITADEL</span>
    </Link>
  );
}
