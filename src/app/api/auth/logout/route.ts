import { clearAuthCookie } from "@/lib/auth/cookies";
import { handleApiError, successResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = successResponse({
      message: "Logout successful.",
    });

    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
