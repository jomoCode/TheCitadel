import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/features/marketing/schemas/enquiry";

const valid = {
  name: "Ada Obi",
  email: "ada@example.com",
  phone: "+234 803 555 0101",
  enquiryType: "viewing",
  message: "I would like to see the show home.",
  consent: true,
};

describe("enquirySchema", () => {
  it("accepts a complete enquiry", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["name", "A"],
    ["email", "not-an-email"],
    ["phone", "abc"],
    ["enquiryType", "spam"],
    ["message", "short"],
    ["consent", false],
  ])("rejects an invalid %s", (field, value) => {
    expect(enquirySchema.safeParse({ ...valid, [field]: value }).success).toBe(false);
  });
});
