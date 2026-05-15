import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { requirePremiumAccess } from "@/lib/subscriptions/service";
import { buildVideoAvailability, requiresSubscriptionForVideos } from "@/lib/videos/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    if (requiresSubscriptionForVideos(user)) {
      await requirePremiumAccess(user);
    }

    const videos = await buildVideoAvailability(user);

    return successResponse({
      ageTrack: user.ageTrack,
      videos,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
