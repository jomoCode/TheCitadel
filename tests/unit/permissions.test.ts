import { describe, expect, it } from "vitest";
import { canUseAdmin, canUseResident, homePathFor, userFromAccessToken } from "@/features/auth/permissions";
import { ADMIN_PERMS, makeToken, RESIDENT_PERMS } from "../utils/fakeAuth";

describe("permissions from the access token", () => {
  it("reads id, email, roles and permissions from the token claims", () => {
    const user = userFromAccessToken(makeToken({ sub: "u9", email: "a@b.com", app_permissions: ["bills.view"], app_roles: ["accountant"] }));
    expect(user).toMatchObject({ id: "u9", email: "a@b.com", roles: ["accountant"] });
    expect(user?.permissions.has("bills.view")).toBe(true);
  });

  it("treats a token without claims as having no permissions", () => {
    const user = userFromAccessToken(makeToken({}));
    expect(user?.permissions.size).toBe(0);
    expect(homePathFor(user!)).toBe("/login?no-access=1");
  });

  it("returns null for garbage", () => {
    expect(userFromAccessToken("not-a-token")).toBeNull();
  });

  it("routes people to the right area after sign-in", () => {
    const admin = userFromAccessToken(makeToken({ app_permissions: ADMIN_PERMS }))!;
    const resident = userFromAccessToken(makeToken({ app_permissions: RESIDENT_PERMS }))!;
    const guard = userFromAccessToken(makeToken({ app_permissions: ["visitors.verify"] }))!;
    expect(homePathFor(admin)).toBe("/admin");
    expect(homePathFor(resident)).toBe("/resident");
    expect(homePathFor(guard)).toBe("/security");
    expect(canUseAdmin(resident)).toBe(false);
    expect(canUseResident(admin)).toBe(false);
  });

  it("a custom role with only one admin permission can still open the admin area", () => {
    const accountant = userFromAccessToken(makeToken({ app_permissions: ["residents.view"] }))!;
    expect(canUseAdmin(accountant)).toBe(true);
  });
});
