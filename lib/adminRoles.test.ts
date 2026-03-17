import { describe, expect, it } from "vitest";
import { ADMIN_PANEL_ROLES, isAdminPanelRole } from "@/lib/adminRoles";

describe("admin roles", () => {
  it("recognizes the supported admin panel roles", () => {
    expect(ADMIN_PANEL_ROLES).toEqual(["admin", "moderator"]);
    expect(isAdminPanelRole("admin")).toBe(true);
    expect(isAdminPanelRole("moderator")).toBe(true);
  });

  it("rejects non-admin roles", () => {
    expect(isAdminPanelRole("user")).toBe(false);
    expect(isAdminPanelRole("studio")).toBe(false);
    expect(isAdminPanelRole(undefined)).toBe(false);
  });
});
