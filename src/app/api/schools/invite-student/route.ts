import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { inviteStudentSchema } from "@/lib/validation/school";
import { inviteStudentToSchool } from "@/lib/schools/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireUser(request, ["teacher"]);
    const body = inviteStudentSchema.parse(await request.json());

    const result = await inviteStudentToSchool({
      inviter: teacher,
      email: body.email,
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
