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

export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole);
}
