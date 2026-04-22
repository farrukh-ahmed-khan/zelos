import { NextRequest } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { inviteTeacherSchema } from "@/lib/validation/school";
import { inviteTeacherToSchool } from "@/lib/schools/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    schoolId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const admin = await requireUser(request, ADMIN_ROLES);
    const { schoolId } = await context.params;
    const body = inviteTeacherSchema.parse(await request.json());

    const result = await inviteTeacherToSchool({
      inviter: admin,
      schoolId,
      email: body.email,
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
