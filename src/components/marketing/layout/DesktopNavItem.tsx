import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { mainNav } from "@/content/marketing/site";
import { cn } from "@/lib/utils/cn";

type NavItem = (typeof mainNav)[number];

/** Gold underline that grows from the centre on hover/focus; stays drawn when the item is active. */
function Underline({ active, groupHover }: { active: boolean; groupHover?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-center bg-gold transition-transform duration-300 ease-out motion-reduce:transition-none",
        active ? "scale-x-100" : "scale-x-0",
        groupHover ? "group-hover:scale-x-100 group-focus-within:scale-x-100" : "group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100",
      )}
    />
  );
}

/** Top-level link; items with children reveal a small dropdown on hover/focus. */
export function DesktopNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const linkClass = cn(
    "text-nav relative py-2 transition-colors duration-300 hover:text-gold focus-visible:text-gold",
    active && "text-gold",
  );

  if (!("children" in item)) {
    return (
      <Link href={item.href} className={cn(linkClass, "group/link")}>
        {item.label}
        <Underline active={active} />
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link href={item.href} className={cn(linkClass, "flex items-center gap-1 group-hover:text-gold")}>
        {item.label}
        <ChevronDown
          className="size-3 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
        <Underline active={active} groupHover />
      </Link>
      <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-300 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
        <ul className="min-w-48 rounded-brand border border-border bg-surface p-2 text-foreground shadow-xl">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block rounded px-3 py-2 text-sm transition-all duration-200 hover:translate-x-1 hover:bg-surface-muted hover:text-gold motion-reduce:transition-none motion-reduce:hover:translate-x-0"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
