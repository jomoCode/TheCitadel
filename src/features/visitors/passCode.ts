/** Normalises typed or scanned input to the XXXX-XXXX pass format. Accepts a full pass link from a QR code too. */
export function formatPassCode(raw: string): string {
  const tail = raw.includes("/") ? raw.split("/").filter(Boolean).pop() ?? "" : raw;
  const clean = tail.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

export const isCompletePassCode = (code: string) => /^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
