/** Mirrors backend app/contracts/visitor.py. */

export type CheckResult =
  | "valid" | "invalid" | "wrong_estate" | "revoked" | "expired" | "used" | "not_yet_valid" | "awaiting_approval" | "approved" | "rejected";

export type Invitation = {
  id: string;
  reference: string;
  pass_code: string | null;
  house_id: string;
  house_identifier: string | null;
  estate_id: string;
  estate_name: string | null;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  headcount: number;
  guest_names: string[];
  valid_from: string;
  valid_until: string;
  multi_entry: boolean;
  entries_used: number;
  requires_approval: boolean;
  instructions: string | null;
  status: "active" | "used" | "expired" | "revoked";
  created_at: string;
};

export type InvitationInput = {
  house_id?: string;
  visitor_name: string;
  visitor_phone?: string | null;
  purpose?: string | null;
  headcount: number;
  guest_names: string[];
  valid_from: string;
  valid_until: string;
  multi_entry: boolean;
  instructions?: string | null;
};

export type GateCheck = {
  result: CheckResult;
  message: string;
  can_admit: boolean;
  invitation_id: string | null;
  approval_request_id: string | null;
  visitor_name: string | null;
  headcount: number | null;
  guest_names: string[];
  house_identifier: string | null;
  host_name: string | null;
  purpose: string | null;
  instructions: string | null;
  valid_from: string | null;
  valid_until: string | null;
  entries_used: number | null;
  multi_entry: boolean | null;
};

export type GateRequest = {
  id: string;
  reference: string;
  kind: "walkin" | "arrival_approval";
  house_id: string;
  house_identifier: string | null;
  estate_id: string;
  visitor_name: string;
  visitor_phone: string | null;
  purpose: string | null;
  headcount: number;
  status: "pending" | "approved" | "rejected" | "expired" | "admitted" | "overridden";
  invitation_id: string | null;
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
};

export type Visit = {
  id: string;
  estate_id: string;
  estate_name: string | null;
  house_id: string;
  house_identifier: string | null;
  visitor_name: string;
  headcount: number;
  entry_method: "pass" | "walkin" | "override";
  override_reason: string | null;
  entered_at: string;
  exited_at: string | null;
  status: "inside" | "exited";
  entry_officer_name: string | null;
};

export type GateHouse = { id: string; identifier: string; block: string | null };
export type PublicPass = { code: string; estate_name: string | null; house_identifier: string | null; visitor_name: string; headcount: number; valid_from: string; valid_until: string; status: string };
export type VisitorDashboard = { expected_today: number; inside_now: number; visits_today: number; pending_walkins: number; overrides_30d: number };
export type EstateVisitorSettings = { id: string; name: string; invite_requires_approval: boolean; walkin_requires_approval: boolean };
export type SecurityAssignment = { user_id: string; estate_id: string; estate_name: string | null; full_name: string | null; email: string | null };
