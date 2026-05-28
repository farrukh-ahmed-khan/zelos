import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { clearAuthCookie } from "@/lib/auth/cookies";
import { handleApiError, successResponse } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    user.status = "deactivated";
    await user.save();

    await queueEmail({
      template: "account-deactivation-confirmation",
      recipient: user.email,
      payload: {
        name: user.name,
        deactivatedAt: user.updatedAt,
      },
    }).catch(() => null);

    const response = successResponse({
      message: "Account deactivated successfully.",
    });

    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
