import { Feather } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * A placeholder shaped like a PostCard, used to fill a row when there are too few articles so the section doesn't
 * look empty. It says "coming soon" rather than pulsing, so it never reads as a page stuck loading.
 */
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)} aria-hidden>
      <div className="grid aspect-3/2 place-items-center rounded-brand border border-dashed border-border bg-surface/60">
        <span className="flex flex-col items-center gap-2 text-muted-foreground">
          <Feather className="size-5" />
          <span className="text-eyebrow">More stories coming soon</span>
        </span>
      </div>
      <div className="mt-5 h-3 w-1/3 rounded-full bg-border" />
      <div className="mt-3 h-5 w-5/6 rounded-full bg-border/80" />
      <div className="mt-2 h-5 w-2/3 rounded-full bg-border/80" />
      <div className="mt-3 h-3 w-full rounded-full bg-border/60" />
      <div className="mt-2 h-3 w-3/4 rounded-full bg-border/60" />
    </div>
  );
}
