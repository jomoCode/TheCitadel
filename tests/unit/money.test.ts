import { describe, expect, it } from "vitest";
import { formatKobo, koboToInput, parseNairaToKobo } from "@/lib/utils/money";

describe("money helpers", () => {
  it("formats kobo as naira", () => {
    expect(formatKobo(5_000_000)).toMatch(/50,000\.00/);
    expect(formatKobo(5_000_000, { whole: true })).toMatch(/50,000$/);
    expect(formatKobo(25_381)).toMatch(/253\.81/);
  });

  it.each([
    ["50,000", 5_000_000],
    ["₦50000.5", 5_000_050],
    [" 1,234.56 ", 123_456],
    ["0.01", 1],
  ])("parses %s", (input, expected) => {
    expect(parseNairaToKobo(input)).toBe(expected);
  });

  it.each(["", "abc", "-5", "0", "1.234", "1e5"])("rejects %s", (input) => {
    expect(parseNairaToKobo(input)).toBeNull();
  });

  it("round-trips through the input format", () => {
    expect(parseNairaToKobo(koboToInput(5_000_050))).toBe(5_000_050);
    expect(koboToInput(5_000_000)).toBe("50000");
  });
});
