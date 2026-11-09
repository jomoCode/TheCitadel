import type { Account, Estate, House, Role } from "@/features/estate-core/types";

export const estate = (over: Partial<Estate> = {}): Estate => ({
  id: "e1", name: "Citadel Gardens", description: null, location: "Lekki", address: null, status: "active",
  created_at: "2026-11-01T00:00:00Z", house_count: 2, ...over,
});

export const house = (over: Partial<House> = {}): House => ({
  id: "h1", estate_id: "e1", estate_name: "Citadel Gardens", identifier: "A1", location: "Block A", block: null, category: null,
  rooms: null, bedrooms: 4, description: null, status: "occupied", created_at: "2026-11-01T00:00:00Z", active_residents: 1, ...over,
});

export const resident = (over: Partial<Account> = {}): Account => ({
  id: "r1", full_name: "Ada Obi", email: "ada@example.com", phone: null, status: "active", created_at: "2026-11-01T00:00:00Z",
  roles: ["resident"],
  occupancies: [{
    id: "o1", house_id: "h1", house_identifier: "A1", estate_id: "e1", estate_name: "Citadel Gardens", resident_id: "r1",
    resident_name: "Ada Obi", is_primary: true, start_date: "2026-01-10", end_date: null, status: "active", end_reason: null,
  }],
  ...over,
});

export const role = (over: Partial<Role> = {}): Role => ({
  id: "role1", key: "accountant", name: "Accountant", description: null, is_system: false, permissions: ["bills.view"], user_count: 0, ...over,
});

export const page = <T,>(items: T[]) => ({ items, total: items.length, page: 1, page_size: 20 });
