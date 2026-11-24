"use client";

import { useMutation } from "@tanstack/react-query";
import type { EnquiryInput } from "../schemas/enquiry";
import { track } from "@/features/analytics";
import { enquiryService } from "../services/EnquiryService";

/** Sends an enquiry and records the conversion on success. */
export function useSubmitEnquiry(sourcePage: string) {
  return useMutation({
    mutationKey: ["enquiry", sourcePage],
    mutationFn: (input: EnquiryInput) => enquiryService.submit(input, sourcePage),
    onSuccess: (_receipt, input) => {
      // Conversion is counted on confirmed success, not on the button press.
      track({
        name: "generate_lead",
        tag: "enquiry_form_submit",
        meta: { enquiry_type: input.enquiryType, property: input.propertySlug || "general" },
      });
    },
  });
}
