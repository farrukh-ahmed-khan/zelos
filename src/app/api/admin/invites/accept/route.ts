import { NextRequest } from "next/server";
import { acceptAdminInvite } from "@/lib/admin-invites/service";
import { setAuthCookie } from "@/lib/auth/cookies";
import { signAuthToken } from "@/lib/auth/jwt";
import { handleApiError, successResponse } from "@/lib/http";
import { serializeUser } from "@/lib/users/serialize-user";
import { acceptAdminInviteSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = acceptAdminInviteSchema.parse(await request.json());
    const user = await acceptAdminInvite(body);
    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const response = successResponse({
      message: "Invite accepted successfully.",
      user: serializeUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
