"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Bell, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "../hooks/useNotifications";

function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Bell with a live unread badge. Opens a sheet (bottom on phones, side on desktop). Notifications are kept, so nothing is missed offline. */
export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { unread, items, loading, markRead } = useNotifications();

  const go = (id: string, link: string | null, read: boolean) => {
    if (!read) markRead.mutate([id]);
    setOpen(false);
    if (link) router.push(link);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} className={cn("relative rounded-full p-2 hover:bg-surface-muted", className)}>
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-[#140e0c]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 flex max-h-[85svh] flex-col rounded-t-2xl bg-background focus:outline-none lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[26rem] lg:rounded-none lg:border-l lg:border-border">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="font-display text-2xl">Notifications</Dialog.Title>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button type="button" onClick={() => markRead.mutate(undefined)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-gold hover:bg-gold-soft">
                  <CheckCheck className="size-3.5" /> Mark all read
                </button>
              )}
              <Dialog.Close aria-label="Close" className="rounded-full p-1.5 text-muted-foreground"><X className="size-5" /></Dialog.Close>
            </div>
          </header>
          <Dialog.Description className="sr-only">Your latest updates</Dialog.Description>
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {loading && <li className="p-6 text-sm text-muted-foreground">Loading…</li>}
            {!loading && items.length === 0 && <li className="p-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => go(n.id, n.link, Boolean(n.read_at))}
                  className={cn("flex w-full gap-3 px-5 py-4 text-left hover:bg-surface-muted", !n.read_at && "bg-gold-soft/50")}>
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-gold")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{n.title}</span>
                    {n.body && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>}
                    <span className="mt-1 block text-[0.7rem] text-muted-foreground">{ago(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
