import type { Page, PageQuery } from "@/features/estate-core/types";
import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type {
  EstateVisitorSettings,
  GateCheck,
  GateHouse,
  GateRequest,
  Invitation,
  InvitationInput,
  PublicPass,
  SecurityAssignment,
  Visit,
  VisitorDashboard,
} from "../types";

/** Resident: passes, history and gate requests for their own household. */
export class ResidentVisitorsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  invitations = (q: PageQuery & { status?: string }) => this.api.get<Page<Invitation>>("/resident/visitors/invitations", q);
  invite = (body: InvitationInput) => this.api.post<Invitation>("/resident/visitors/invitations", body);
  revoke = (id: string, reason?: string) => this.api.post<Invitation>(`/resident/visitors/invitations/${id}/revoke`, { reason: reason ?? null });
  visits = (q: PageQuery) => this.api.get<Page<Visit>>("/resident/visitors/visits", q);
  gateRequests = () => this.api.get<GateRequest[]>("/resident/visitors/gate-requests");
  decide = (id: string, approve: boolean, note?: string) => this.api.post<GateRequest>(`/resident/visitors/gate-requests/${id}/decision`, { approve, note: note ?? null });
}

/** Gate officers: checks, admissions, walk-ins, exits — always within their own estate. */
export class GateApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  check = (code: string) => this.api.post<GateCheck>("/security/check", { code });
  admit = (invitationId: string) => this.api.post<Visit>(`/security/invitations/${invitationId}/admit`);
  houses = () => this.api.get<GateHouse[]>("/security/houses");
  registerWalkin = (body: { house_id: string; visitor_name: string; visitor_phone?: string | null; purpose?: string | null; headcount: number }) =>
    this.api.post<GateRequest>("/security/walkins", body);
  walkin = (id: string) => this.api.get<GateRequest>(`/security/walkins/${id}`);
  admitWalkin = (id: string) => this.api.post<Visit>(`/security/walkins/${id}/admit`);
  override = (id: string, reason: string) => this.api.post<Visit>(`/security/walkins/${id}/override`, { reason });
  inside = () => this.api.get<Visit[]>("/security/inside");
  recent = (q: PageQuery) => this.api.get<Page<Visit>>("/security/recent", q);
  exit = (visitId: string) => this.api.post<Visit>(`/security/visits/${visitId}/exit`);
}

/** Admin: visitor overview, records, estate rules and officer assignments. */
export class VisitorsAdminApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  dashboard = (estateId?: string) => this.api.get<VisitorDashboard>("/admin/visitors/dashboard", { estate_id: estateId });
  visits = (q: PageQuery & { estate_id?: string; status?: string; method?: string; house_id?: string }) => this.api.get<Page<Visit>>("/admin/visitors/visits", q);
  invitations = (q: PageQuery & { estate_id?: string; status?: string }) => this.api.get<Page<Invitation>>("/admin/visitors/invitations", q);
  gateRequests = (q: { estate_id?: string; status?: string }) => this.api.get<GateRequest[]>("/admin/visitors/gate-requests", q);
  revoke = (id: string, reason: string) => this.api.post<Invitation>(`/admin/visitors/invitations/${id}/revoke`, { reason });
  settings = (estateId: string) => this.api.get<EstateVisitorSettings>(`/admin/estates/${estateId}/visitor-settings`);
  updateSettings = (estateId: string, body: Partial<EstateVisitorSettings>) => this.api.patch<EstateVisitorSettings>(`/admin/estates/${estateId}/visitor-settings`, body);
  assignments = () => this.api.get<SecurityAssignment[]>("/admin/security-assignments");
  assign = (userId: string, estateId: string) => this.api.put<{ user_id: string; estate_id: string }>(`/admin/security-assignments/${userId}`, { estate_id: estateId });
}

export const fetchPublicPass = (code: string) => apiClient.get<PublicPass>(`/public/passes/${encodeURIComponent(code)}`);

export const residentVisitorsApi = new ResidentVisitorsApi();
export const gateApi = new GateApi();
export const visitorsAdminApi = new VisitorsAdminApi();
