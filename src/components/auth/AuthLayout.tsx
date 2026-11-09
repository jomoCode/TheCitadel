import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/marketing/layout/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

/** Phone: photo band on top with the form rising over it like a card. Desktop: photo half, form half. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative h-56 lg:h-auto">
        <Image src="/images/citadel/facade-front.jpg" alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <Link href="/" aria-label="Home" className="absolute left-5 top-5 lg:left-10 lg:top-10">
          <BrandLogo tone="onDark" />
        </Link>
        <p className="absolute bottom-10 left-10 hidden max-w-sm font-display text-4xl leading-tight text-white lg:block">
          Your home, <span className="italic text-[#d4af5a]">beautifully managed.</span>
        </p>
      </div>
      <div className="relative -mt-6 flex flex-col rounded-t-3xl bg-background px-6 pb-10 pt-8 lg:mt-0 lg:justify-center lg:rounded-none lg:px-16">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
