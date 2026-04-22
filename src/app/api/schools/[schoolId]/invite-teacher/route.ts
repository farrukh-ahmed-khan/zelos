import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { inviteTeacherSchema } from "@/lib/validation/school";
import { inviteTeacherToSchool } from "@/lib/schools/service";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    schoolId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireAdminPermission(request, "schools.manage");
    const { schoolId } = await context.params;
    const body = inviteTeacherSchema.parse(await request.json());

    const result = await inviteTeacherToSchool({
      inviter: admin,
      schoolId,
      email: body.email,
    });

    await queueEmail({
      template: "school-teacher-invite",
      recipient: result.invite.email,
      payload: {
        inviteUrl: result.inviteUrl,
        schoolId: result.invite.schoolId,
        expiresAt: result.invite.expiresAt,
      },
    });

    return successResponse(
      {
        message: "Teacher invite created successfully.",
        invite: {
          id: result.invite._id.toString(),
          email: result.invite.email,
          role: result.invite.role,
          schoolId: result.invite.schoolId,
          expiresAt: result.invite.expiresAt,
          used: result.invite.used,
          inviteUrl: result.inviteUrl,
          ...(process.env.NODE_ENV !== "production"
            ? { token: result.rawToken }
            : {}),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
