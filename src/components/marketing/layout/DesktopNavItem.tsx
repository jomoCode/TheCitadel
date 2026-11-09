import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { mainNav } from "@/content/marketing/site";
import { cn } from "@/lib/utils/cn";

type NavItem = (typeof mainNav)[number];

/** Top-level link; items with children reveal a small dropdown on hover/focus. */
export function DesktopNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const linkClass = cn("text-nav py-2 transition-opacity hover:opacity-70", active && "underline decoration-gold underline-offset-8");

  if (!("children" in item)) {
    return (
      <Link href={item.href} className={linkClass}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link href={item.href} className={cn(linkClass, "flex items-center gap-1")}>
        {item.label} <ChevronDown className="size-3" aria-hidden />
      </Link>
      <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <ul className="min-w-48 rounded-brand border border-border bg-surface p-2 text-foreground shadow-xl">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href} className="block rounded px-3 py-2 text-sm hover:bg-surface-muted hover:text-gold">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
