import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  serializeMentorApplication,
  updateMentorApplication,
} from "@/lib/mentor-applications/service";
import { updateMentorApplicationSchema } from "@/lib/validation/mentor";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    applicationId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");
    const { applicationId } = await context.params;
    const body = updateMentorApplicationSchema.parse(await request.json());

    const application = await updateMentorApplication({
      applicationId,
      actorId: actor._id.toString(),
      status: body.status,
      reviewNote: body.reviewNote,
    });

    return successResponse({
      message: "Mentor application updated successfully.",
      application: serializeMentorApplication(application),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
