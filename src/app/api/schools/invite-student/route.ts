import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { inviteStudentSchema } from "@/lib/validation/school";
import { inviteStudentToSchool } from "@/lib/schools/service";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireUser(request, ["teacher"]);
    const body = inviteStudentSchema.parse(await request.json());

    const result = await inviteStudentToSchool({
      inviter: teacher,
      email: body.email,
    });

    await queueEmail({
      template: "school-student-invite",
      recipient: result.invite.email,
      payload: {
        inviteUrl: result.inviteUrl,
        schoolId: result.invite.schoolId,
        expiresAt: result.invite.expiresAt,
      },
    });

    return successResponse(
      {
        message: "Student invite created successfully.",
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
