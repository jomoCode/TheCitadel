import { AlertTriangle, Inbox } from "lucide-react";
import { ApiError } from "@/lib/api/ApiClient";
import { cn } from "@/lib/utils/cn";

export function EmptyState({ title, body, action, className }: { title: string; body?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center", className)}>
      <Inbox className="size-8 text-gold" aria-hidden />
      <p className="mt-3 font-display text-xl">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shows the friendly server message plus a reference code staff can quote to support. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error instanceof ApiError ? error : null;
  return (
    <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-5">
      <p className="flex items-center gap-2 font-medium text-danger">
        <AlertTriangle className="size-4" aria-hidden /> {apiError?.message ?? "Something went wrong while loading this page."}
      </p>
      {apiError?.correlationId && <p className="mt-1 text-xs text-muted-foreground">Reference: {apiError.correlationId}</p>}
      {apiError?.location && <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">{apiError.location}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 text-sm underline underline-offset-4">Try again</button>
      )}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
      ))}
    </div>
  );
}
