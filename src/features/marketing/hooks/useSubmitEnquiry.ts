"use client";

import { useMutation } from "@tanstack/react-query";
import type { EnquiryInput } from "../schemas/enquiry";
import { analyticsTracker } from "../services/AnalyticsTracker";
import { enquiryService } from "../services/EnquiryService";

/** Sends an enquiry and records the business event on success. */
export function useSubmitEnquiry(sourcePage: string) {
  return useMutation({
    mutationKey: ["enquiry", sourcePage],
    mutationFn: (input: EnquiryInput) => enquiryService.submit(input, sourcePage),
    onSuccess: (_receipt, input) => {
      analyticsTracker.track(input.enquiryType === "viewing" ? "viewing_requested" : "enquiry_submitted", {
        enquiry_type: input.enquiryType,
        property: input.propertySlug,
      });
    },
  });
}
