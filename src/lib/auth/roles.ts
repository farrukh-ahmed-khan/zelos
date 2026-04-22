export const USER_ROLES = [
  "mentee",
  "subscriber",
  "child",
  "teacher",
  "student",
  "mentor",
  "sub-admin",
  "super-admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SELF_REGISTER_ROLES = ["mentee", "subscriber"] as const;

export const ADMIN_ROLES: UserRole[] = ["sub-admin", "super-admin"];

export const ADMIN_PERMISSION_KEYS = [
  "content.manage",
  "schools.manage",
  "forum.moderate",
  "events.manage",
  "users.manage-limited",
  "analytics.read",
  "billing.read",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number];

export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole);
}

export function hasAdminPermission(
  role: UserRole,
  permissions: string[] | undefined,
  requiredPermission: AdminPermission,
) {
  if (role === "super-admin") {
    return true;
  }

  if (role !== "sub-admin") {
    return false;
  }

  return (permissions ?? []).includes(requiredPermission);
}
