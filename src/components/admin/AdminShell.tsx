"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";
import { isActive, visibleNav, type AdminNavItem } from "./nav";

function NavLinks({ items, pathname, onNavigate }: { items: AdminNavItem[]; pathname: string; onNavigate?: () => void }) {
  const groups = [...new Set(items.map((i) => i.group))];
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-eyebrow mb-1.5 px-3 !text-[0.6rem] text-muted-foreground">{group}</p>
          <NavGroup items={items.filter((i) => i.group === group)} pathname={pathname} onNavigate={onNavigate} />
        </div>
      ))}
    </div>
  );
}

function NavGroup({ items, pathname, onNavigate }: { items: AdminNavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-brand px-3 py-2 text-sm transition-colors",
                active ? "bg-gold-soft font-medium text-gold" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground")}>
              <item.icon className="size-4" aria-hidden /> {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserBlock({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuth();
  return (
    <div className={cn("flex items-center gap-3", compact ? "" : "border-t border-border pt-4")}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user?.email}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{user?.roles.join(", ").replace(/_/g, " ") || "Staff"}</p>
      </div>
      <NotificationBell />
      <ThemeToggle />
      <button type="button" onClick={signOut} aria-label="Sign out" className="rounded-full p-2 text-muted-foreground hover:text-danger"><LogOut className="size-4" /></button>
    </div>
  );
}

/** Desktop: fixed sidebar. Phone: compact top bar + bottom tab bar for the four main sections + a "More" drawer. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const items = visibleNav(can);
  const primary = items.filter((i) => i.primary);

  return (
    <div className="min-h-svh lg:pl-64 print:pl-0">
      <aside className="fixed inset-y-0 left-0 hidden print:!hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link href="/admin" className="mb-8 px-3">
          <span className="font-display text-2xl">Citadel</span>
          <span className="text-eyebrow mt-1 block text-gold">Administration</span>
        </Link>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto"><NavLinks items={items} pathname={pathname} /></nav>
        <UserBlock />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 print:hidden items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
        <span className="font-display text-xl">Citadel</span>
        <div className="flex items-center"><NotificationBell />
        <Dialog.Root open={drawer} onOpenChange={setDrawer}>
          <Dialog.Trigger aria-label="Open menu" className="p-2"><Menu className="size-5" /></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-5 focus:outline-none">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="font-display text-2xl">Menu</Dialog.Title>
                <Dialog.Close aria-label="Close menu"><X className="size-5" /></Dialog.Close>
              </div>
              <nav aria-label="Admin menu"><NavLinks items={items} pathname={pathname} onNavigate={() => setDrawer(false)} /></nav>
              <div className="mt-5 border-t border-border pt-4"><UserBlock compact /></div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root></div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 lg:pb-12 lg:pt-10">{children}</main>

      <nav aria-label="Admin sections" className="print:hidden safe-bottom fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-background/95 backdrop-blur lg:hidden"
        style={{ gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))` }}>
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-[0.65rem]", active ? "text-gold" : "text-muted-foreground")}>
              <item.icon className="size-5" aria-hidden /> {item.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setDrawer(true)} className="flex flex-col items-center gap-1 py-2.5 text-[0.65rem] text-muted-foreground">
          <Menu className="size-5" aria-hidden /> More
        </button>
      </nav>
    </div>
  );
}
