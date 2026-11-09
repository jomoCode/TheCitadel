import Link from "next/link";
import { footerNav, siteConfig } from "@/content/marketing/site";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";
import { BrandMark } from "./BrandMark";
import { NewsletterForm } from "./NewsletterForm";

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-eyebrow text-gold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[#d9cfc2] transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Footer is always dark (espresso & gold) in both themes — it anchors every page. */
export async function SiteFooter() {
  const { contact, socials } = await loadSiteSettings();
  return (
    <footer className="bg-[#140e0c] text-[#f4ede3]">
      <div className="container-lux grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <BrandMark tone="onDark" className="items-start" />
          <p className="max-w-xs text-sm leading-relaxed text-[#a8998a]">{siteConfig.description}</p>
          <address className="space-y-1 text-sm not-italic text-[#d9cfc2]">
            <p>{contact.address}</p>
            <p>
              <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white">{contact.phone}</a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>
            </p>
          </address>
        </div>
        <FooterColumn title="Explore" links={footerNav.explore} />
        <FooterColumn title="Services" links={footerNav.services} />
        <div>
          <h3 className="text-eyebrow text-gold">Get updates</h3>
          <p className="mt-4 text-sm text-[#a8998a]">New launches and price updates, at most twice a month.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-lux flex flex-col gap-4 py-6 text-xs text-[#a8998a] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.legalName} All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerNav.legal.map((link) => (
              <li key={link.href}><Link href={link.href} className="hover:text-white">{link.label}</Link></li>
            ))}
            {socials.map((s) => (
              <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" className="hover:text-white">{s.name}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
