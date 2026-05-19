import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { ADMIN_ROLES, hasRequiredRole } from "@/lib/auth/roles";

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

    if (pathname.startsWith("/api/subscriptions")) {
      if (payload.role === "child") {
        return unauthorizedResponse("Child accounts cannot access billing.", 403);
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
    "/api/schools/:path*/students",
    "/api/schools/:path*/progress",
    "/api/schools/invite-student",
  ],
};
