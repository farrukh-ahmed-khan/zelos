import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { requirePremiumAccess } from "@/lib/subscriptions/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const subscription = await requirePremiumAccess(user);

    return successResponse({
      message: "Premium content access granted.",
      premiumContent: [
        "Advanced mentor library",
        "Subscriber-only learning paths",
        "Exclusive platform resources",
      ],
      subscription,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
