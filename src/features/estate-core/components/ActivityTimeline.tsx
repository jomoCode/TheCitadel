"use client";

import { useState } from "react";
import { Pagination } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { useAuditLog } from "../hooks/usePeople";
import type { AuditEntry } from "../types";

/** Turns "occupancy.ended" into "Occupancy ended". */
export function describeAction(action: string): string {
  return humanize(action.replace(/\./g, " "));
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Changes({ entry }: { entry: AuditEntry }) {
  const keys = [...new Set([...Object.keys(entry.previous_value ?? {}), ...Object.keys(entry.new_value ?? {})])];
  if (keys.length === 0) return null;
  return (
    <dl className="mt-2 space-y-0.5 text-xs">
      {keys.map((key) => {
        const hadBefore = Boolean(entry.previous_value && key in entry.previous_value);
        return (
          <div key={key} className="flex flex-wrap gap-1">
            <dt className="text-muted-foreground">{humanize(key)}:</dt>
            <dd>
              {hadBefore && <span className="text-muted-foreground line-through">{formatValue(entry.previous_value?.[key])}</span>}
              {hadBefore && " → "}
              <span>{formatValue(entry.new_value?.[key])}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Read-only, append-only history of changes. Used on house pages and the full activity log. */
export function ActivityTimeline({ entityType, entityId }: { entityType?: string; entityId?: string }) {
  const [page, setPage] = useState(1);
  const query = useAuditLog({ entity_type: entityType, entity_id: entityId, page, page_size: 15 });

  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={3} />;
  if (query.data.items.length === 0) return <EmptyState title="No activity yet" />;

  return (
    <>
      <ol className="relative space-y-5 border-l border-border pl-5">
        {query.data.items.map((entry) => (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full border-2 border-background bg-gold" aria-hidden />
            <p className="text-sm font-medium">{describeAction(entry.action)}</p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={entry.occurred_at}>{new Date(entry.occurred_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</time>
              {!entityType && ` · ${humanize(entry.entity_type)}`}
            </p>
            {entry.reason && <p className="mt-1 text-xs italic">“{entry.reason}”</p>}
            <Changes entry={entry} />
          </li>
        ))}
      </ol>
      <Pagination page={query.data.page} pageSize={query.data.page_size} total={query.data.total} onPage={setPage} />
    </>
  );
}
