import { jwtDecode } from "jwt-decode";

/** Mirrors backend `app/core/permissions.py`. The server is the authority; this only drives what the UI shows. */
export const Perm = {
  EstatesView: "estates.view",
  EstatesManage: "estates.manage",
  HousesView: "houses.view",
  HousesManage: "houses.manage",
  ResidentsView: "residents.view",
  ResidentsManage: "residents.manage",
  RolesManage: "roles.manage",
  AuditView: "audit.view",
  PaymentHeadsManage: "payment_heads.manage",
  BillsView: "bills.view",
  BillsIssue: "bills.issue",
  BillsAdjust: "bills.adjust",
  PaymentsView: "payments.view",
  PaymentsRecordOffline: "payments.record_offline",
  PaymentsRefund: "payments.refund",
  ReportsView: "reports.view",
  ReportsExport: "reports.export",
  SettingsManage: "settings.manage",
  SelfPay: "self.pay",
  TicketsView: "tickets.view",
  TicketsManage: "tickets.manage",
  NoticesManage: "notices.manage",
  VisitorsView: "visitors.view",
  VisitorsVerify: "visitors.verify",
  VisitorsOverride: "visitors.override",
  SelfBills: "self.bills",
  SelfTickets: "self.tickets",
  SelfVisitors: "self.visitors",
  CmsManage: "cms.manage",
  LeadsView: "leads.view",
  LeadsManage: "leads.manage",
  AnalyticsView: "analytics.view",
} as const;

export type PermissionCode = (typeof Perm)[keyof typeof Perm] | (string & {});

export type SessionUser = {
  id: string;
  email: string | null;
  roles: string[];
  permissions: ReadonlySet<string>;
};

type AccessClaims = {
  sub: string;
  email?: string;
  app_permissions?: string[];
  app_roles?: string[];
};

/** Reads permissions embedded in the access token by the Supabase custom access-token hook. Instant, no network call. */
export function userFromAccessToken(token: string): SessionUser | null {
  try {
    const claims = jwtDecode<AccessClaims>(token);
    return {
      id: claims.sub,
      email: claims.email ?? null,
      roles: claims.app_roles ?? [],
      permissions: new Set(claims.app_permissions ?? []),
    };
  } catch {
    return null;
  }
}

const ADMIN_AREA_PERMISSIONS = [
  Perm.EstatesView, Perm.HousesView, Perm.ResidentsView, Perm.RolesManage, Perm.AuditView,
  Perm.BillsView, Perm.PaymentsView, Perm.ReportsView, Perm.TicketsView, Perm.NoticesManage, Perm.VisitorsView,
  Perm.CmsManage, Perm.LeadsView, Perm.AnalyticsView,
];
const RESIDENT_AREA_PERMISSIONS = [Perm.SelfBills, Perm.SelfTickets, Perm.SelfVisitors];

export const canUseAdmin = (user: SessionUser) => ADMIN_AREA_PERMISSIONS.some((p) => user.permissions.has(p));
export const canUseGate = (user: SessionUser) => user.permissions.has(Perm.VisitorsVerify);
export const canUseResident = (user: SessionUser) => RESIDENT_AREA_PERMISSIONS.some((p) => user.permissions.has(p));

/** Where to send someone after they sign in. */
export function homePathFor(user: SessionUser): string {
  if (canUseAdmin(user)) return "/admin";
  if (canUseResident(user)) return "/resident";
  if (user.permissions.has(Perm.VisitorsVerify)) return "/security";
  return "/login?no-access=1";
}
