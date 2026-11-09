/** All money from the API is integer kobo (₦1 = 100 kobo). These helpers are the only place we convert. */

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ngnWhole = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

/** 5000000 → "₦50,000.00" (or "₦50,000" with whole=true when there are no kobo) */
export function formatKobo(kobo: number, { whole = false }: { whole?: boolean } = {}): string {
  const naira = kobo / 100;
  return whole && Number.isInteger(naira) ? ngnWhole.format(naira) : ngn.format(naira);
}

/** "50,000.5" / "₦50000" → 5000050. Returns null for anything that isn't a positive amount with ≤ 2 decimals. */
export function parseNairaToKobo(input: string): number | null {
  const cleaned = input.replace(/[₦,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, fraction = ""] = cleaned.split(".");
  const kobo = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return kobo > 0 && Number.isSafeInteger(kobo) ? kobo : null;
}

/** 5000050 → "50000.50" for pre-filling inputs. */
export function koboToInput(kobo: number): string {
  return (kobo / 100).toFixed(2).replace(/\.00$/, "");
}
