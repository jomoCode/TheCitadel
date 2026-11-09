import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Tone = "auto" | "onDark";

const LOGO = { width: 900, height: 401 } as const;
const ALT = "Quo Construction & Engineering Limited";
const SIZE = "h-10 w-auto md:h-12";

/**
 * Quo Construction & Engineering logo on a transparent background.
 * - "auto": full-colour artwork on light surfaces, switching to the dark-surface version in dark mode.
 * - "onDark": always the dark-surface version (navy tagline in warm white) — for photos and the dark footer.
 */
export function BrandLogo({ tone = "auto", className }: { tone?: Tone; className?: string }) {
  if (tone === "onDark") {
    return <Image src="/brand/quo-logo-on-dark.png" alt={ALT} {...LOGO} priority className={cn(SIZE, className)} />;
  }
  return (
    <span className={cn("inline-flex", className)}>
      <Image src="/brand/quo-logo.png" alt={ALT} {...LOGO} priority className={cn(SIZE, "dark:hidden")} />
      <Image src="/brand/quo-logo-on-dark.png" alt="" {...LOGO} aria-hidden priority className={cn(SIZE, "hidden dark:block")} />
    </span>
  );
}

export function BrandMark({ tone, className }: { tone?: Tone; className?: string }) {
  return (
    <Link href="/" aria-label="Home" className={cn("flex items-center", className)}>
      <BrandLogo tone={tone} />
    </Link>
  );
}
