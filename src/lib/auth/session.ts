import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { ApiError } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import User, { type UserDocument } from "@/models/User";
import {
  hasAdminPermission,
  hasRequiredRole,
  type AdminPermission,
  type UserRole,
} from "@/lib/auth/roles";
import { syncSchoolLicenseStatus } from "@/lib/schools/license";

export async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  try {
    const payload = await verifyAuthToken(token);

    if (!payload.sub || !payload.email || !payload.role) {
      throw new ApiError(401, "Invalid authentication token.");
    }

    return payload;
  } catch {
    throw new ApiError(401, "Invalid or expired authentication token.");
  }
}

export async function requireUser(
  request: NextRequest,
  allowedRoles?: UserRole[],
): Promise<UserDocument> {
  const payload = await requireAuth(request);

  if (allowedRoles && !hasRequiredRole(payload.role, allowedRoles)) {
    throw new ApiError(403, "You are not allowed to access this resource.");
  }

  await connectToDatabase();

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists.");
  }

  const effectiveStatus = user.status ?? (user.isBanned ? "banned" : "active");

  if (effectiveStatus === "banned" || user.isBanned) {
    throw new ApiError(403, "This account has been banned.");
  }

  if (effectiveStatus === "suspended") {
    throw new ApiError(403, "This account is currently suspended.");
  }

  if (["teacher", "student"].includes(user.role) && user.schoolId) {
    const school = await syncSchoolLicenseStatus(user.schoolId);

    if (!school) {
      throw new ApiError(403, "This school account is no longer available.");
    }

    if (school.licenseStatus !== "active") {
      throw new ApiError(
        403,
        "This school license is inactive. Access is suspended until renewal.",
      );
    }
  }

  return user;
}

export async function requireAdminPermission(
  request: NextRequest,
  permission: AdminPermission,
) {
  const user = await requireUser(request, ["sub-admin", "super-admin"]);

  if (!hasAdminPermission(user.role, user.adminPermissions, permission)) {
    throw new ApiError(403, "You do not have permission to access this admin area.");
  }

  return user;
}
