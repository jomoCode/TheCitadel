import { describe, expect, it } from "vitest";
import { toneFor } from "@/features/visitors/components/CheckResultCard";
import { passLink } from "@/features/visitors/components/PassCard";
import { formatPassCode, isCompletePassCode } from "@/features/visitors/passCode";
import type { GateCheck } from "@/features/visitors/types";

const check = (over: Partial<GateCheck>): GateCheck => ({
  result: "valid", message: "", can_admit: true, invitation_id: "i1", approval_request_id: null, visitor_name: "Tunde", headcount: 1, guest_names: [],
  house_identifier: "A1", host_name: "Ada", purpose: null, instructions: null, valid_from: null, valid_until: null, entries_used: 0, multi_entry: false, ...over,
});

describe("formatPassCode", () => {
  it("uppercases, strips noise and inserts the dash", () => {
    expect(formatPassCode("abcd2345")).toBe("ABCD-2345");
    expect(formatPassCode(" ab cd-23 45 ")).toBe("ABCD-2345");
    expect(formatPassCode("abc")).toBe("ABC");
  });
  it("reads the code from a scanned pass link", () => {
    expect(formatPassCode("https://citadel.example/pass/WXYZ-6789")).toBe("WXYZ-6789");
  });
  it("never accepts more than 8 characters", () => {
    expect(formatPassCode("ABCD23456789")).toBe("ABCD-2345");
  });
  it("knows when a code is complete", () => {
    expect(isCompletePassCode("ABCD-2345")).toBe(true);
    expect(isCompletePassCode("ABCD-234")).toBe(false);
  });
});

describe("gate result tone", () => {
  it("is green only when the officer may admit", () => {
    expect(toneFor(check({}))).toBe("go");
    expect(toneFor(check({ result: "awaiting_approval", can_admit: false }))).toBe("wait");
    expect(toneFor(check({ result: "not_yet_valid", can_admit: false }))).toBe("wait");
    expect(toneFor(check({ result: "expired", can_admit: false }))).toBe("stop");
    expect(toneFor(check({ result: "invalid", can_admit: false }))).toBe("stop");
  });
});

describe("passLink", () => {
  it("points at the public pass page on this site", () => {
    expect(passLink("ABCD-2345")).toBe(`${window.location.origin}/pass/ABCD-2345`);
  });
});
