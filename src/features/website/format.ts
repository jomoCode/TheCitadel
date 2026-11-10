/** "8 Nov, 14:05" — compact date and time for enquiry lists. */
export const shortDateTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** tel: link. Drops the "(0)" trunk prefix in "+234 (0) 707…" so the dialled number is +234707…, not +2340707…. */
export const telHref = (phone: string) => `tel:${phone.replace(/\(0\)/g, "").replace(/[^+\d]/g, "")}`;

/** WhatsApp link for a Nigerian number written locally (0803…) or internationally (+234 803…). */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
