import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { EnquiryInput } from "../schemas/enquiry";
import { AttributionTracker, attributionTracker } from "./AttributionTracker";

export type EnquiryReceipt = { id: string; reference: string };

/** Submits website enquiries to the backend with page source and campaign attribution (PRD §11.3). */
export class EnquiryService {
  constructor(
    private readonly api: ApiClient = apiClient,
    private readonly attribution: AttributionTracker = attributionTracker,
  ) {}

  async submit(input: EnquiryInput, sourcePage: string): Promise<EnquiryReceipt> {
    const { consent, ...fields } = input;
    return this.api.post<EnquiryReceipt>("/public/enquiries", {
      ...fields,
      consent_given: consent,
      source_page: sourcePage,
      attribution: this.attribution.read(),
    });
  }
}

export const enquiryService = new EnquiryService();
