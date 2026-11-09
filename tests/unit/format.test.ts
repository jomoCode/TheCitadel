import { describe, expect, it } from "vitest";
import { formatBedrooms, formatLongDate, formatNaira, formatNairaCompact } from "@/lib/utils/format";

describe("format utilities", () => {
  it("formats compact naira amounts", () => {
    expect(formatNairaCompact(185_000_000)).toBe("₦185m");
    expect(formatNairaCompact(1_250_000_000)).toBe("₦1.3bn");
    expect(formatNairaCompact(95_500_000)).toBe("₦95.5m");
    expect(formatNairaCompact(2_000)).toBe("₦2k");
    expect(formatNairaCompact(500)).toBe("₦500");
  });

  it("formats full naira amounts with grouping", () => {
    expect(formatNaira(185_000_000)).toMatch(/185,000,000/);
  });

  it("formats bedrooms including studios and ranges", () => {
    expect(formatBedrooms(0, 3)).toBe("Studio – 3-bed");
    expect(formatBedrooms(4, 4)).toBe("4-bed");
  });

  it("formats long dates in UTC", () => {
    expect(formatLongDate("2026-10-28")).toBe("28 October 2026");
  });
});
