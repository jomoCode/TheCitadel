import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { Page, PageQuery } from "@/features/estate-core/types";
import type { Category, Faq, FaqInput, Insights, PageSeo, Post, PostInput, PostStatus, SiteSettings, Testimonial, TestimonialInput } from "../types";

/** Journal articles (permission: cms.manage). */
export class JournalApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (q: PageQuery & { status?: PostStatus }) => this.api.get<Page<Post>>("/admin/posts", q);
  get = (id: string) => this.api.get<Post>(`/admin/posts/${id}`);
  create = (body: PostInput & { title: string }) => this.api.post<Post>("/admin/posts", body);
  update = (id: string, body: PostInput) => this.api.patch<Post>(`/admin/posts/${id}`, body);
  setCover = (id: string, file: File) => this.api.upload<Post>(`/admin/posts/${id}/cover`, file);
  addImage = (id: string, file: File) => this.api.upload<{ url: string }>(`/admin/posts/${id}/images`, file);
  publish = (id: string, publishAt?: string | null) => this.api.post<Post>(`/admin/posts/${id}/publish`, { publish_at: publishAt ?? null });
  unpublish = (id: string) => this.api.post<Post>(`/admin/posts/${id}/unpublish`);
  archive = (id: string) => this.api.post<Post>(`/admin/posts/${id}/archive`);
  categories = () => this.api.get<Category[]>("/admin/posts/categories");
  createCategory = (name: string) => this.api.post<Category>("/admin/posts/categories", { name });
}

/** Contact details, FAQs, testimonials and page search-engine text (permission: cms.manage). */
export class SiteContentApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  settings = () => this.api.get<SiteSettings>("/admin/site/settings");
  saveSettings = (body: Omit<SiteSettings, "updated_at">) => this.api.put<SiteSettings>("/admin/site/settings", body);
  faqs = () => this.api.get<Faq[]>("/admin/site/faqs");
  createFaq = (body: FaqInput) => this.api.post<Faq>("/admin/site/faqs", body);
  updateFaq = (id: string, body: Partial<FaqInput>) => this.api.patch<Faq>(`/admin/site/faqs/${id}`, body);
  testimonials = () => this.api.get<Testimonial[]>("/admin/site/testimonials");
  createTestimonial = (body: TestimonialInput) => this.api.post<Testimonial>("/admin/site/testimonials", body);
  updateTestimonial = (id: string, body: Partial<TestimonialInput> & { is_published?: boolean }) => this.api.patch<Testimonial>(`/admin/site/testimonials/${id}`, body);
  testimonialPhoto = (id: string, file: File) => this.api.upload<Testimonial>(`/admin/site/testimonials/${id}/photo`, file);
  reorder = (table: "faqs" | "testimonials", ids: string[]) => this.api.put(`/admin/site/${table}/order`, { ids });
  remove = (table: "faqs" | "testimonials", id: string) => this.api.delete(`/admin/site/${table}/${id}`);
  pages = () => this.api.get<PageSeo[]>("/admin/site/pages");
  pageNames = () => this.api.get<Record<string, string>>("/admin/site/page-names");
  savePage = (path: string, body: { title: string | null; description: string | null; image_url?: string | null }) =>
    this.api.put<PageSeo>(`/admin/site/pages?path=${encodeURIComponent(path)}`, body);
}

export class InsightsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  summary = (days: number) => this.api.get<Insights>("/admin/insights", { days });
}

export const journalApi = new JournalApi();
export const siteContentApi = new SiteContentApi();
export const insightsApi = new InsightsApi();
