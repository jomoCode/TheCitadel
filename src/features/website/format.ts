/** "8 Nov, 14:05" — compact date and time for enquiry lists. */
export const shortDateTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** WhatsApp link for a Nigerian number written locally (0803…) or internationally (+234 803…). */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}
