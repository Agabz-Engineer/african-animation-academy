export const ADMIN_PANEL_ROLES = ["admin", "moderator"] as const;

export type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[number];

export const isAdminPanelRole = (role: unknown): role is AdminPanelRole =>
  typeof role === "string" && ADMIN_PANEL_ROLES.includes(role as AdminPanelRole);

