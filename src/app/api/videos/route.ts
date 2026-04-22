import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { buildVideoAvailability } from "@/lib/videos/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const videos = await buildVideoAvailability(user);

    return successResponse({
      ageTrack: user.ageTrack,
      videos,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
