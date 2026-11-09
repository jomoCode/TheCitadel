"use client";

import { Building2, CalendarDays, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { InfoTip } from "@/components/ui/InfoTip";
import { BillAlerts } from "@/features/billing/components/BillAlerts";
import { DuesReminderDialog } from "@/features/billing/components/DuesReminderDialog";
import { useResidentBillingSummary } from "@/features/billing/hooks/useResidentBilling";
import { useResidentHome } from "@/features/resident/hooks/useResidentHome";
import { residentSupportApi } from "@/features/support/api/SupportApi";
import { NoticeCard } from "@/features/support/components/NoticeCard";
import { useMyNotices } from "@/features/support/hooks/useSupport";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatLongDate } from "@/lib/utils/format";
import { formatKobo } from "@/lib/utils/money";

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}


export default function ResidentHomePage() {
  const home = useResidentHome();
  const billing = useResidentBillingSummary();
  const notices = useMyNotices();

  if (home.error) return <ErrorState error={home.error} onRetry={home.refetch} />;
  if (!home.data) return <SkeletonRows rows={3} />;
  const { full_name, homes } = home.data;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="font-display text-3xl md:text-4xl">{full_name.split(" ")[0]}</h1>
      </header>

      <section aria-label="Your home" className="space-y-3">
        {homes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Your home hasn&apos;t been linked to your account yet. The estate office will do this shortly.
          </div>
        )}
        {homes.map((h) => (
          <article key={h.id} className="relative overflow-hidden rounded-2xl text-white">
            <Image src="/images/properties/gardens-1.jpg" alt="" fill sizes="(min-width: 1024px) 60rem, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
            <div className="relative flex min-h-52 flex-col justify-end p-5 md:min-h-64 md:p-8">
              <p className="text-eyebrow flex items-center gap-1.5 text-white/80"><Building2 className="size-3.5" /> {h.estate_name}</p>
              <p className="mt-1 font-display text-4xl">House {h.house_identifier}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
                <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> Since {formatLongDate(h.start_date)}</span>
                {h.is_primary && <span className="flex items-center gap-1 text-[#d4af5a]">Main contact <InfoTip text={getTooltip("resident.primary")} className="text-white/70" /></span>}
              </div>
            </div>
          </article>
        ))}
      </section>

      {billing.data && (
        <section aria-label="Your bills" className="space-y-3">
          {billing.data.alerts.length > 0 && <DuesReminderDialog alerts={billing.data.alerts} outstandingKobo={billing.data.outstanding_kobo} />}
          <Link href="/resident/bills" className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 active:bg-surface-muted">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">To pay</p>
              <p className="mt-1 font-display text-3xl tabular-nums">{formatKobo(billing.data.outstanding_kobo)}</p>
              <p className="text-xs text-muted-foreground">{billing.data.open_bills ? `${billing.data.open_bills} unpaid bill${billing.data.open_bills === 1 ? "" : "s"}` : "You're all paid up"}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
          <BillAlerts alerts={billing.data.alerts} limit={2} />
        </section>
      )}

      {notices.data && notices.data.length > 0 && (
        <section aria-label="Notices" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Notices</h2>
            <Link href="/resident/notices" className="text-sm text-gold">See all</Link>
          </div>
          {notices.data.slice(0, 2).map((n) => <NoticeCard key={n.id} notice={n} compact openAttachment={residentSupportApi.attachmentLink} />)}
        </section>
      )}

    </div>
  );
}
