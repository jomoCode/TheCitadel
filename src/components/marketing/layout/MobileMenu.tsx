"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { mainNav } from "@/content/marketing/site";
import { telHref, useSiteSettings } from "@/features/marketing/context/SiteSettingsContext";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "./BrandMark";

/** Full-screen menu for phones and tablets — large serif links, thumb-friendly spacing. */
export function MobileMenu() {
  const { contact } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger aria-label="Open menu" className="inline-flex size-10 items-center justify-center lg:hidden">
        <Menu className="size-5" aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-background text-foreground focus:outline-none">
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <div className="container-lux flex h-16 items-center justify-between">
            <BrandLogo />
            <Dialog.Close aria-label="Close menu" className="inline-flex size-10 items-center justify-center">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="container-lux flex-1 overflow-y-auto pb-8 pt-6">
            <ul className="space-y-1">
              {mainNav.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.4 }}
                >
                  <Link href={item.href} onClick={close} className="block py-3 font-display text-3xl">
                    {item.label}
                  </Link>
                  {"children" in item && (
                    <ul className="mb-2 ml-1 space-y-1 border-l border-gold/40 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} onClick={close} className="block py-1.5 text-sm text-muted-foreground">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="container-lux safe-bottom space-y-3 border-t border-border py-5">
            <Link href="/contact" onClick={close} className={cn(buttonVariants({ variant: "solid" }), "w-full")}>
              Book a viewing
            </Link>
            <a href={telHref(contact.mobile)} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              <Phone className="size-3.5" aria-hidden /> Call us
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
