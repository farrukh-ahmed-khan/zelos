import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { acceptSchoolInviteSchema } from "@/lib/validation/school";
import { acceptSchoolInvite } from "@/lib/schools/service";
import { serializeUser } from "@/lib/users/serialize-user";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = acceptSchoolInviteSchema.parse(await request.json());
    const user = await acceptSchoolInvite(body);

    await queueEmail({
      template: user.role === "teacher" ? "teacher-welcome" : "student-welcome",
      recipient: user.email,
      payload: {
        name: user.name,
        role: user.role,
      },
    });

    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = successResponse(
      {
        message: "School invite accepted successfully.",
        user: serializeUser(user),
      },
      { status: 201 },
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
