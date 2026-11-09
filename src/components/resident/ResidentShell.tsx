"use client";

import { Home, LifeBuoy, ReceiptText, UserRound, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import { cn } from "@/lib/utils/cn";

type Tab = { label: string; href: string; icon: LucideIcon; soon?: boolean };

const TABS: Tab[] = [
  { label: "Home", href: "/resident", icon: Home },
  { label: "Bills", href: "/resident/bills", icon: ReceiptText },
  { label: "Visitors", href: "/resident/visitors", icon: Users },
  { label: "Support", href: "/resident/support", icon: LifeBuoy },
  { label: "Profile", href: "/resident/profile", icon: UserRound },
];

const isActive = (pathname: string, href: string) => (href === "/resident" ? pathname === href : pathname.startsWith(href));

/** Native-app feel on phones (bottom tab bar, large touch targets); a calm top nav on desktop. */
export function ResidentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-[100svh] bg-background">
      <header className="sticky top-0 z-30 print:hidden border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:h-16">
          <Link href="/resident" className="font-display text-xl">Citadel</Link>
          <nav aria-label="Resident" className="hidden items-center gap-1 lg:flex">
            {TABS.map((t) => (
              <Link key={t.href} href={t.soon ? "#" : t.href} aria-disabled={t.soon}
                className={cn("rounded-full px-4 py-2 text-sm", isActive(pathname, t.href) ? "bg-gold-soft text-gold" : "text-muted-foreground hover:text-foreground", t.soon && "pointer-events-none opacity-50")}>
                {t.label}{t.soon && <span className="ml-1 text-[0.6rem] uppercase">soon</span>}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 lg:pb-12 lg:pt-10">{children}</main>

      <nav aria-label="Resident tabs" className="print:hidden safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {TABS.map((t) => {
          const active = isActive(pathname, t.href);
          const content = (
            <>
              <t.icon className="size-5" aria-hidden />
              <span>{t.label}</span>
              {t.soon && <span className="absolute right-2 top-1 rounded-full bg-surface-muted px-1 text-[0.5rem] uppercase">soon</span>}
            </>
          );
          const className = cn("relative flex flex-col items-center gap-1 py-2.5 text-[0.65rem]", active ? "text-gold" : "text-muted-foreground", t.soon && "opacity-50");
          return t.soon ? (
            <span key={t.href} aria-disabled className={className}>{content}</span>
          ) : (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>
          );
        })}
      </nav>
    </div>
  );
}
