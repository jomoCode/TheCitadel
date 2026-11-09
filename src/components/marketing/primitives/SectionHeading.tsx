import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  /** Optional gold italic second line, e.g. "Their New Homes". */
  highlight?: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
};

export function EyebrowPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-eyebrow inline-flex items-center rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-gold", className)}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, highlight, intro, align = "left", className }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <header className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      {eyebrow && <EyebrowPill>{eyebrow}</EyebrowPill>}
      <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
        {title}
        {highlight && <span className="mt-1 block italic text-gold">{highlight}</span>}
      </h2>
      {intro && <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>}
    </header>
  );
}
