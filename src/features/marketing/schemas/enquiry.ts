import { z } from "zod";

export const ENQUIRY_TYPES = [
  { value: "general", label: "General enquiry" },
  { value: "property", label: "About a property" },
  { value: "viewing", label: "Book a viewing" },
  { value: "purchase", label: "I want to buy" },
  { value: "rental", label: "I want to rent" },
  { value: "landowner", label: "I own land" },
  { value: "partnership", label: "Partnership" },
  { value: "referral", label: "Become a referrer" },
] as const;

const enquiryValues = ENQUIRY_TYPES.map((t) => t.value) as [string, ...string[]];

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Please enter a valid phone number"),
  enquiryType: z.enum(enquiryValues),
  propertySlug: z.string().optional(),
  message: z.string().trim().min(10, "A short message helps us prepare (10 characters or more)").max(2000),
  consent: z.literal(true, { message: "Please agree so we can contact you" }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
