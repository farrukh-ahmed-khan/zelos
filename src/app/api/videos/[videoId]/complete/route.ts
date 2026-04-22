import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { completeVideoSchema } from "@/lib/validation/video";
import {
  buildVideoAvailability,
  markVideoAsCompleted,
  resolveCompletableVideo,
} from "@/lib/videos/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    videoId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { videoId } = await context.params;
    const body = completeVideoSchema.parse(await request.json());

    const video = await resolveCompletableVideo({ user, videoId });
    await markVideoAsCompleted({
      user,
      video,
      watchedPercentage: body.watchedPercentage,
    });

    const videos = await buildVideoAvailability(user);

    return successResponse({
      message: "Video marked as completed.",
      videoId,
      watchedPercentage: body.watchedPercentage,
      videos,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
