const nairaFull = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

/** ₦185,000,000 */
export function formatNaira(amount: number): string {
  return nairaFull.format(amount);
}

/** ₦185m / ₦1.2bn — compact form for cards and badges. */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${trimZero(amount / 1_000_000_000)}bn`;
  if (amount >= 1_000_000) return `₦${trimZero(amount / 1_000_000)}m`;
  if (amount >= 1_000) return `₦${trimZero(amount / 1_000)}k`;
  return `₦${amount}`;
}

/** A price of 0 means the developer hasn't published one: "Price on request". */
export function priceLabel(amount: number, { compact = false, from = false }: { compact?: boolean; from?: boolean } = {}): string {
  if (amount <= 0) return "Price on request";
  const value = compact ? formatNairaCompact(amount) : formatNaira(amount);
  return from ? `from ${value}` : value;
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/** 28 October 2026 */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** "Studio" for 0, "3-bed" otherwise; ranges become "Studio – 4-bed". */
export function formatBedrooms(min: number, max: number): string {
  const label = (n: number) => (n === 0 ? "Studio" : `${n}-bed`);
  return min === max ? label(min) : `${label(min)} – ${label(max)}`;
}
