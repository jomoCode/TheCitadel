"use client";

import { Clock, LogOut, ScanLine, UserPlus, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/marketing/layout/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/AuthProvider";

const TABS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Check pass", href: "/security", icon: ScanLine },
  { label: "Walk-in", href: "/security/walkin", icon: UserPlus },
  { label: "Inside", href: "/security/inside", icon: Users },
  { label: "Recent", href: "/security/recent", icon: Clock },
];

/** A single-purpose gate app: big targets, high contrast, works one-handed on a phone or a gate tablet. */
export function SecurityShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  return (
    <div className="app-aurora min-h-svh">
      <header className="glass-nav glass-bar sticky top-0 z-30 border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo tone="onDark" className="h-8 shrink-0 md:h-8" />
            <div className="min-w-0 border-l border-border pl-3">
              <p className="text-eyebrow leading-none text-gold">Gate</p>
              <p className="mt-1 truncate text-[0.65rem] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <button type="button" onClick={signOut} aria-label="Sign out" className="rounded-full p-2 text-muted-foreground hover:text-danger"><LogOut className="size-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5">{children}</main>
      <nav aria-label="Gate" className="glass-nav glass-bar safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border">
        {TABS.map((t) => {
          const active = t.href === "/security" ? pathname === "/security" : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-2.5 text-xs", active ? "font-medium text-gold" : "text-muted-foreground")}>
              <span className={cn("rounded-full px-4 py-1 transition-all", active && "glass-nav-active")}><t.icon className="size-6" aria-hidden /></span> {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
