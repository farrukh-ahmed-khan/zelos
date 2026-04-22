import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { ADMIN_ROLES, hasRequiredRole } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { resolveSubscriptionAccessForUser } from "@/lib/subscriptions/service";
import { syncSchoolLicenseStatus } from "@/lib/schools/license";

function unauthorizedResponse(message: string, status = 401) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
      },
    },
    { status },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorizedResponse("Authentication required.");
  }

  try {
    const payload = await verifyAuthToken(token);

    if (pathname.startsWith("/api/admin")) {
      if (!hasRequiredRole(payload.role, ADMIN_ROLES)) {
        return unauthorizedResponse(
          "You are not allowed to access this resource.",
          403,
        );
      }
    }

    if (
      pathname.startsWith("/api/subscriptions") ||
      pathname.startsWith("/api/premium")
    ) {
      await connectToDatabase();

      const user = await User.findById(payload.sub);

      if (!user) {
        return unauthorizedResponse("Authenticated user no longer exists.");
      }

      if (user.isBanned || user.status === "banned") {
        return unauthorizedResponse("This account has been banned.", 403);
      }

      if (user.status === "suspended") {
        return unauthorizedResponse("This account is currently suspended.", 403);
      }

      if (["teacher", "student"].includes(user.role) && user.schoolId) {
        const school = await syncSchoolLicenseStatus(user.schoolId);

        if (!school || school.licenseStatus !== "active") {
          return unauthorizedResponse(
            "This school license is inactive. Access is suspended until renewal.",
            403,
          );
        }
      }

      if (pathname.startsWith("/api/subscriptions") && user.role === "child") {
        return unauthorizedResponse("Child accounts cannot access billing.", 403);
      }

      if (pathname.startsWith("/api/premium")) {
        const resolved = await resolveSubscriptionAccessForUser(user);

        if (!resolved.hasPremiumAccess) {
          return unauthorizedResponse(
            "An active subscription is required to access premium content.",
            403,
          );
        }
      }
    }

    return NextResponse.next();
  } catch {
    return unauthorizedResponse("Invalid or expired authentication token.");
  }
}

export const config = {
  matcher: [
    "/api/auth/logout",
    "/api/me",
    "/api/protected",
    "/api/admin/:path*",
    "/api/subscriptions/:path*",
    "/api/premium/:path*",
    "/api/videos/:path*",
    "/api/forum/report",
    "/api/forum/threads/:path*/replies",
    "/api/events/:path*/rsvp",
    "/api/schools",
    "/api/schools/:path*/invite-teacher",
    "/api/schools/invite-student",
    "/api/subscribers/:path*",
  ],
};
