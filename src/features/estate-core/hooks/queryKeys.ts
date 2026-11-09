/** One place for every cache key, so related screens refresh together after a change. */
export const qk = {
  overview: ["overview"] as const,
  estates: (params?: object) => ["estates", params ?? {}] as const,
  estate: (id: string) => ["estate", id] as const,
  estateSummary: (id: string) => ["estate", id, "summary"] as const,
  houses: (params?: object) => ["houses", params ?? {}] as const,
  house: (id: string) => ["house", id] as const,
  houseOccupancies: (id: string) => ["house", id, "occupancies"] as const,
  residents: (params?: object) => ["residents", params ?? {}] as const,
  resident: (id: string) => ["resident", id] as const,
  staff: (params?: object) => ["staff", params ?? {}] as const,
  roles: ["roles"] as const,
  permissions: ["permissions"] as const,
  audit: (params?: object) => ["audit", params ?? {}] as const,
  residentHome: ["resident-home"] as const,
};

/** Prefixes invalidated after any estate/house/resident change (counts and lists all depend on each other). */
export const ESTATE_CORE_PREFIXES = [["overview"], ["estates"], ["estate"], ["houses"], ["house"], ["residents"], ["resident"], ["audit"]];
