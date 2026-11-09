/** Mirrors backend contracts (app/contracts/*.py). */

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };
export type PageQuery = { page?: number; page_size?: number; q?: string };

export type EstateStatus = "active" | "archived";
export type Estate = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  address: string | null;
  status: EstateStatus;
  created_at: string;
  house_count: number;
};
export type EstateInput = { name: string; description?: string | null; location?: string | null; address?: string | null };
export type EstateSummary = { estate: Estate; houses_by_status: Record<string, number>; active_residents: number };

export type HouseStatus = "available" | "occupied" | "reserved" | "under_maintenance" | "inactive";
export type House = {
  id: string;
  estate_id: string;
  estate_name: string | null;
  identifier: string;
  location: string;
  block: string | null;
  category: string | null;
  rooms: number | null;
  bedrooms: number | null;
  description: string | null;
  status: HouseStatus;
  created_at: string;
  active_residents: number;
};
export type HouseInput = {
  estate_id: string;
  identifier: string;
  location: string;
  block?: string | null;
  category?: string | null;
  rooms?: number | null;
  bedrooms?: number | null;
  description?: string | null;
};
export type HouseUpdate = Partial<Omit<HouseInput, "estate_id">> & { status?: "available" | "reserved" | "under_maintenance" };

export type Occupancy = {
  id: string;
  house_id: string;
  house_identifier: string | null;
  estate_id: string | null;
  estate_name: string | null;
  resident_id: string;
  resident_name: string | null;
  is_primary: boolean;
  start_date: string;
  end_date: string | null;
  status: "active" | "ended";
  end_reason: string | null;
};

export type Account = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  created_at: string;
  roles: string[];
  occupancies: Occupancy[];
};
export type AccountInput = { full_name: string; email: string; phone?: string | null; temporary_password?: string | null };
export type ResidentInput = AccountInput & { house_id?: string | null; is_primary?: boolean; start_date?: string | null };
export type StaffInput = AccountInput & { role_ids: string[] };

export type Role = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  user_count: number;
};
export type PermissionInfo = { code: string; description: string; group: string };

export type AdminOverview = {
  estates: number;
  houses: number;
  houses_by_status: Record<string, number>;
  residents: number;
  active_occupancies: number;
};

export type AuditEntry = {
  id: number;
  occurred_at: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
};

export type ResidentHome = { full_name: string; email: string; phone: string | null; homes: Occupancy[] };
