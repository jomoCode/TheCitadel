"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { buttonVariants } from "@/components/ui/Button";
import { mainNav } from "@/content/marketing/site";
import { cn } from "@/lib/utils/cn";
import { BrandMark } from "./BrandMark";
import { DesktopNavItem } from "./DesktopNavItem";
import { MobileMenu } from "./MobileMenu";
import { useHeaderAppearance } from "./useHeaderAppearance";

export function SiteHeader() {
  const { transparent, pathname } = useHeaderAppearance();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        transparent ? "bg-transparent text-white" : "border-b border-border bg-background/90 text-foreground backdrop-blur-md",
      )}
    >
      <div className="container-lux flex h-16 items-center justify-between md:h-20">
        <BrandMark />

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {mainNav.map((item) => (
            <DesktopNavItem key={item.href} item={item} active={pathname.startsWith(item.href.split("/").slice(0, 2).join("/"))} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: transparent ? "ghostLight" : "outline", size: "sm" }),
              "hidden lg:inline-flex",
            )}
          >
            Contact
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
