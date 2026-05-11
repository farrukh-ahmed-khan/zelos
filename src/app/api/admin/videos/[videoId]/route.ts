import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { deleteVideoByAdmin, updateVideoByAdmin } from "@/lib/admin/service";
import { handleApiError, successResponse } from "@/lib/http";
import { updateVideoSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ videoId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { videoId } = await context.params;
    const body = await request.json();
    const parsed = updateVideoSchema.parse(body);

    const video = await updateVideoByAdmin({
      videoId,
      updates: {
        ...parsed,
        releaseDate: parsed.releaseDate ? new Date(parsed.releaseDate) : undefined,
      },
    });

    return successResponse({
      message: "Video updated.",
      video,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { videoId } = await context.params;
    const video = await deleteVideoByAdmin(videoId);

    return successResponse({
      message: "Video deleted.",
      videoId: video._id.toString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
