"use client";

import { Clock, LogOut, ScanLine, UserPlus, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div>
            <p className="font-display text-lg leading-none">Citadel Gate</p>
            <p className="text-[0.65rem] text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <button type="button" onClick={signOut} aria-label="Sign out" className="rounded-full p-2 text-muted-foreground hover:text-danger"><LogOut className="size-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-5">{children}</main>
      <nav aria-label="Gate" className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur">
        {TABS.map((t) => {
          const active = t.href === "/security" ? pathname === "/security" : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
              className={cn("flex flex-col items-center gap-1 py-3 text-xs", active ? "text-gold" : "text-muted-foreground")}>
              <t.icon className="size-6" aria-hidden /> {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
