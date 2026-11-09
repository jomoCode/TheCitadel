import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TICKET_STATUS_WORDS, type TicketEvent } from "../types";

function time(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * Conversation view. `perspective` decides which side is "me": the resident sees their own messages on the right;
 * staff see staff messages on the right. Status changes appear as quiet system lines.
 */
export function TicketThread({ events, perspective }: { events: TicketEvent[]; perspective: "resident" | "staff" }) {
  return (
    <ol className="space-y-3" aria-label="Conversation">
      {events.map((e) => {
        if (e.kind === "status_changed") {
          return (
            <li key={e.id} className="py-1 text-center text-xs text-muted-foreground">
              <span className="rounded-full bg-surface-muted px-3 py-1">
                {e.to_status ? TICKET_STATUS_WORDS[e.to_status] : "Updated"}{e.actor_name && perspective === "staff" ? ` · ${e.actor_name}` : ""} · {time(e.created_at)}
              </span>
              {e.body && <span className="mt-1 block italic">“{e.body}”</span>}
            </li>
          );
        }
        const mine = perspective === "staff" ? e.actor_is_staff : !e.actor_is_staff;
        return (
          <li key={e.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm",
              e.is_internal ? "border border-warning/50 bg-warning/10" : mine ? "rounded-br-sm bg-foreground text-background" : "rounded-bl-sm border border-border bg-surface")}>
              {e.is_internal && <p className="mb-1 flex items-center gap-1 text-[0.7rem] font-medium text-warning"><Lock className="size-3" /> Internal note — residents can&apos;t see this</p>}
              <p className="whitespace-pre-wrap">{e.body}</p>
              <p className={cn("mt-1.5 text-[0.7rem]", mine && !e.is_internal ? "text-background/70" : "text-muted-foreground")}>
                {e.actor_is_staff ? (perspective === "resident" ? "Estate team" : e.actor_name ?? "Staff") : e.actor_name ?? "Resident"} · {time(e.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
