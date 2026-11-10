import Link from "next/link";
import { InfoTip } from "@/components/ui/InfoTip";

type StatCardProps = { label: string; value: number | string; tip?: string; href?: string; hint?: string };

/** Each card in a row takes the next colour in the palette (see .stat-card in globals.css). */
export function StatCard({ label, value, tip, href, hint }: StatCardProps) {
  const body = (
    <>
      <p className="stat-card-label flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">{label}{tip && <InfoTip text={tip} />}</p>
      <p className="mt-2 font-display text-3xl md:text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="stat-card block rounded-xl border p-4 transition-all hover:-translate-y-0.5 md:p-5">{body}</Link>
  ) : (
    <div className="stat-card rounded-xl border p-4 md:p-5">{body}</div>
  );
}
