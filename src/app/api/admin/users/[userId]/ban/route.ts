import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateUserBanSchema } from "@/lib/validation/admin";
import { updateUserBanStatus } from "@/lib/admin/service";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");
    const { userId } = await context.params;
    const body = updateUserBanSchema.parse(await request.json());

    const user = await updateUserBanStatus({
      actor,
      userId,
      isBanned: body.isBanned,
    });

    return successResponse({
      message: body.isBanned ? "User banned successfully." : "User unbanned successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
