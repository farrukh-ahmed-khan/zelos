import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { ApiError } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import User, { type UserDocument } from "@/models/User";
import { hasRequiredRole, type UserRole } from "@/lib/auth/roles";

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

  if (user.isBanned) {
    throw new ApiError(403, "This account has been banned.");
  }

  return user;
}
