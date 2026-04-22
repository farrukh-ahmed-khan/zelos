import { NextRequest } from "next/server";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { resolveSubscriptionAccessForUser } from "@/lib/subscriptions/service";
import { serializeResolvedSubscription } from "@/lib/subscriptions/serialize-subscription";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    if (user.role === "child") {
      throw new ApiError(403, "Child accounts cannot access billing.");
    }

    const resolved = await resolveSubscriptionAccessForUser(user);

    return successResponse({
      autoRenewal: false,
      subscription: serializeResolvedSubscription(resolved),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
