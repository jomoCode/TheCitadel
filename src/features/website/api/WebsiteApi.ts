import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { Page, PageQuery } from "@/features/estate-core/types";
import type { Enquiry, EnquiryCounts, EnquiryDetail, HandledFilter, Listing, ListingInput } from "../types";

/** Property listings shown on the public website (permission: cms.manage). */
export class ListingsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (q: PageQuery & { published?: boolean }) => this.api.get<Page<Listing>>("/admin/properties", q);
  get = (id: string) => this.api.get<Listing>(`/admin/properties/${id}`);
  create = (body: ListingInput) => this.api.post<Listing>("/admin/properties", body);
  update = (id: string, body: ListingInput) => this.api.patch<Listing>(`/admin/properties/${id}`, body);
  addPhoto = (id: string, file: File) => this.api.upload<Listing>(`/admin/properties/${id}/photos`, file);
  removePhoto = (id: string, photoId: string) => this.api.delete<Listing>(`/admin/properties/${id}/photos/${photoId}`);
  reorderPhotos = (id: string, photoIds: string[]) => this.api.put<Listing>(`/admin/properties/${id}/photos/order`, { photo_ids: photoIds });
}

/** Enquiries sent from the public website (view: leads.view; tick off / notes: leads.manage). */
export class EnquiriesApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (q: PageQuery & { handled?: HandledFilter; enquiry_type?: string; property_id?: string }) => this.api.get<Page<Enquiry>>("/admin/enquiries", q);
  counts = () => this.api.get<EnquiryCounts>("/admin/enquiries/counts");
  get = (id: string) => this.api.get<EnquiryDetail>(`/admin/enquiries/${id}`);
  setHandled = (id: string, handled: boolean) => this.api.post<EnquiryDetail>(`/admin/enquiries/${id}/handled`, { handled });
  addNote = (id: string, body: string) => this.api.post<EnquiryDetail>(`/admin/enquiries/${id}/notes`, { body });
}

export const listingsApi = new ListingsApi();
export const enquiriesApi = new EnquiriesApi();
