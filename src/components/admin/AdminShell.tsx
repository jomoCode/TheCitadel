"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/marketing/layout/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";
import { isActive, visibleNav, type AdminNavItem } from "./nav";

function NavLinks({ items, pathname, onNavigate }: { items: AdminNavItem[]; pathname: string; onNavigate?: () => void }) {
  const groups = [...new Set(items.map((i) => i.group))];
  return (
    <div>
      {groups.map((group, i) => (
        <div key={group}>
          {i > 0 && <div className="glass-divider my-4" aria-hidden />}
          <p className="text-eyebrow mb-2 px-3 !text-[0.7rem] font-semibold text-muted-foreground">{group}</p>
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
              className={cn("flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-all",
                active ? "glass-nav-active font-bold" : "text-white/85 hover:bg-surface-muted hover:text-foreground")}>
              <item.icon className="size-5" strokeWidth={2.25} aria-hidden /> {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserBlock() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user?.email}</p>
        <p className="truncate text-xs font-medium capitalize text-muted-foreground">{user?.roles.join(", ").replace(/_/g, " ") || "Staff"}</p>
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
    <div className="app-aurora has-sidebar min-h-svh lg:pl-[16.5rem] print:pl-0">
      <div aria-hidden className="glass-scene fixed inset-y-0 left-0 hidden w-[16.5rem] print:!hidden lg:block" />
      <aside className="glass-nav fixed inset-y-0 left-0 z-30 hidden w-[16.5rem] flex-col border-r border-border px-4 py-6 print:!hidden lg:flex">
        <Link href="/admin" className="px-3">
          <BrandLogo tone="onDark" className="h-11 md:h-11" />
          <span className="text-eyebrow mt-2 block text-gold">Administration</span>
        </Link>
        <div className="glass-divider -mx-4 my-5" aria-hidden />
        <nav aria-label="Admin" className="-mx-1 flex-1 overflow-y-auto px-1"><NavLinks items={items} pathname={pathname} /></nav>
        <div className="glass-divider -mx-4 my-4" aria-hidden />
        <UserBlock />
      </aside>

      <header className="glass-nav glass-bar sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-4 print:hidden lg:hidden">
        <Link href="/admin"><BrandLogo tone="onDark" className="h-8 md:h-8" /></Link>
        <div className="flex items-center"><NotificationBell />
        <Dialog.Root open={drawer} onOpenChange={setDrawer}>
          <Dialog.Trigger aria-label="Open menu" className="p-2"><Menu className="size-5" /></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="glass-nav glass-bar safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-2xl border-t border-border p-5 focus:outline-none">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="font-display text-2xl">Menu</Dialog.Title>
                <Dialog.Close aria-label="Close menu"><X className="size-5" /></Dialog.Close>
              </div>
              <nav aria-label="Admin menu"><NavLinks items={items} pathname={pathname} onNavigate={() => setDrawer(false)} /></nav>
              <div className="glass-divider my-5" aria-hidden /><UserBlock />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root></div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 lg:pb-12 lg:pt-10">{children}</main>

      <nav aria-label="Admin sections" className="glass-nav glass-bar safe-bottom fixed inset-x-0 bottom-0 z-30 grid border-t border-border print:hidden lg:hidden"
        style={{ gridTemplateColumns: `repeat(${primary.length + 1}, minmax(0, 1fr))` }}>
        {primary.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2 text-[0.65rem]", active ? "font-medium text-gold" : "text-muted-foreground")}>
              <span className={cn("rounded-full px-3 py-1 transition-all", active && "glass-nav-active")}><item.icon className="size-5" aria-hidden /></span> {item.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setDrawer(true)} className="flex flex-col items-center gap-1 py-2 text-[0.65rem] text-muted-foreground">
          <span className="px-3 py-1"><Menu className="size-5" aria-hidden /></span> More
        </button>
      </nav>
    </div>
  );
}
