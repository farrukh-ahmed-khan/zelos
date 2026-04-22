import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createVideoSchema } from "@/lib/validation/admin";
import { createVideoByAdmin } from "@/lib/admin/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const body = createVideoSchema.parse(await request.json());

    const video = await createVideoByAdmin(body);

    return successResponse(
      {
        message: "Video uploaded successfully.",
        video: {
          id: video._id.toString(),
          title: video.title,
          description: video.description,
          url: video.url,
          ageTrack: video.ageTrack,
          order: video.order,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
