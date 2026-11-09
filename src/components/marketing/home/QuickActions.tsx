import { ArrowUpRight, Handshake, Home, LandPlot } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { InfoTip } from "@/components/ui/InfoTip";
import type { TooltipKey } from "@/lib/tooltips/registry";

const ACTIONS: { title: string; body: string; href: string; icon: typeof Home; tip?: TooltipKey }[] = [
  { title: "Own a Citadel residence", body: "A limited release of Premium residences is offered for sale.", href: "/guides/how-to-buy", icon: Home },
  { title: "Sell or develop your land", body: "Get a transparent offer or a joint-development proposal.", href: "/guides/sell-your-land", icon: LandPlot, tip: "marketing.landowner" },
  { title: "Earn as you refer", body: "Introduce a buyer and earn 1% of the sale value.", href: "/referral", icon: Handshake, tip: "marketing.referral" },
];

export function QuickActions() {
  return (
    <section aria-label="How we can help" className="container-lux py-16 md:py-24">
      <ul className="grid gap-px overflow-hidden rounded-brand border border-border bg-border md:grid-cols-3">
        {ACTIONS.map((action, i) => (
          <Reveal as="li" key={action.href} delay={i * 0.1} className="group relative bg-background p-7 transition-colors hover:bg-surface md:p-10">
            <action.icon className="size-6 text-gold" aria-hidden />
            <h3 className="mt-6 flex items-center gap-1 font-display text-2xl">
              <Link href={action.href} className="after:absolute after:inset-0">{action.title}</Link>
              {action.tip && <InfoTip tip={action.tip} className="relative z-10" />}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{action.body}</p>
            <ArrowUpRight className="absolute right-6 top-6 size-5 text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold" aria-hidden />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
