import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type {
  Account,
  AdminOverview,
  AuditEntry,
  Estate,
  EstateInput,
  EstateSummary,
  House,
  HouseInput,
  HouseUpdate,
  Occupancy,
  Page,
  PageQuery,
  PermissionInfo,
  ResidentHome,
  ResidentInput,
  Role,
  StaffInput,
} from "../types";

/** Estates & houses endpoints. */
export class PropertyRegistryApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  listEstates = (q: PageQuery & { status?: string }) => this.api.get<Page<Estate>>("/admin/estates", q);
  getEstate = (id: string) => this.api.get<Estate>(`/admin/estates/${id}`);
  estateSummary = (id: string) => this.api.get<EstateSummary>(`/admin/estates/${id}/summary`);
  createEstate = (body: EstateInput) => this.api.post<Estate>("/admin/estates", body);
  updateEstate = (id: string, body: Partial<EstateInput> & { status?: string }) => this.api.patch<Estate>(`/admin/estates/${id}`, body);

  listHouses = (q: PageQuery & { estate_id?: string; status?: string }) => this.api.get<Page<House>>("/admin/houses", q);
  getHouse = (id: string) => this.api.get<House>(`/admin/houses/${id}`);
  houseOccupancies = (id: string) => this.api.get<Occupancy[]>(`/admin/houses/${id}/occupancies`);
  createHouse = (body: HouseInput) => this.api.post<House>("/admin/houses", body);
  updateHouse = (id: string, body: HouseUpdate) => this.api.patch<House>(`/admin/houses/${id}`, body);
  deactivateHouse = (id: string, reason: string) => this.api.post<House>(`/admin/houses/${id}/deactivate`, { reason });
  reactivateHouse = (id: string) => this.api.post<House>(`/admin/houses/${id}/reactivate`);
  deleteHouse = (id: string) => this.api.delete<void>(`/admin/houses/${id}`);
}

/** Resident & staff account endpoints. */
export class PeopleApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  listResidents = (q: PageQuery & { estate_id?: string }) => this.api.get<Page<Account>>("/admin/residents", q);
  getResident = (id: string) => this.api.get<Account>(`/admin/residents/${id}`);
  createResident = (body: ResidentInput) => this.api.post<Account>("/admin/residents", body);
  updateResident = (id: string, body: { full_name?: string; phone?: string | null }) => this.api.patch<Account>(`/admin/residents/${id}`, body);
  assignHouse = (id: string, body: { house_id: string; is_primary: boolean; start_date?: string | null }) =>
    this.api.post<Occupancy>(`/admin/residents/${id}/assignments`, body);
  moveResident = (id: string, body: { from_occupancy_id: string; to_house_id: string; reason: string; move_date?: string | null }) =>
    this.api.post<Occupancy>(`/admin/residents/${id}/move`, body);
  endOccupancy = (occupancyId: string, body: { reason: string; end_date?: string | null }) =>
    this.api.post<Occupancy>(`/admin/occupancies/${occupancyId}/end`, body);
  setActive = (id: string, active: boolean, reason: string) =>
    this.api.post<Account>(`/admin/accounts/${id}/${active ? "reactivate" : "deactivate"}`, { reason });
  sendPasswordReset = (id: string) => this.api.post<{ ok: boolean; message: string }>(`/admin/accounts/${id}/password-reset`);

  listStaff = (q: PageQuery) => this.api.get<Page<Account>>("/admin/staff", q);
  createStaff = (body: StaffInput) => this.api.post<Account>("/admin/staff", body);
  setRoles = (id: string, roleIds: string[]) => this.api.put<Account>(`/admin/accounts/${id}/roles`, { role_ids: roleIds });
}

/** Roles, overview, audit and resident self-service endpoints. */
export class AdminApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  overview = () => this.api.get<AdminOverview>("/admin/overview");
  audit = (q: PageQuery & { entity_type?: string; entity_id?: string }) => this.api.get<Page<AuditEntry>>("/admin/audit", q);
  permissions = () => this.api.get<PermissionInfo[]>("/admin/permissions");
  roles = () => this.api.get<Role[]>("/admin/roles");
  createRole = (body: { name: string; description?: string; permissions: string[] }) => this.api.post<Role>("/admin/roles", body);
  updateRole = (id: string, body: { name?: string; description?: string; permissions?: string[] }) => this.api.patch<Role>(`/admin/roles/${id}`, body);
  deleteRole = (id: string) => this.api.delete<void>(`/admin/roles/${id}`);

  residentHome = () => this.api.get<ResidentHome>("/resident/home");
  updateOwnPhone = (phone: string) => this.api.patch<Account>("/resident/profile", { phone });
}

export const registryApi = new PropertyRegistryApi();
export const peopleApi = new PeopleApi();
export const adminApi = new AdminApi();
