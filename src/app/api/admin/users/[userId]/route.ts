import { NextRequest } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { deleteUserWithRelations } from "@/lib/admin/service";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireUser(request, ADMIN_ROLES);
    const { userId } = await context.params;

    const deletedUser = await deleteUserWithRelations({ actor, userId });

    return successResponse({
      message: "User deleted successfully.",
      user: serializeUser(deletedUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
