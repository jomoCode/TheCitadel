import Link from "next/link";
import { InfoTip } from "@/components/ui/InfoTip";

type StatCardProps = { label: string; value: number | string; tip?: string; href?: string; hint?: string };

export function StatCard({ label, value, tip, href, hint }: StatCardProps) {
  const body = (
    <>
      <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">{label}{tip && <InfoTip text={tip} />}</p>
      <p className="mt-2 font-display text-3xl md:text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold md:p-5">{body}</Link>
  ) : (
    <div className="rounded-lg border border-border bg-surface p-4 md:p-5">{body}</div>
  );
}
