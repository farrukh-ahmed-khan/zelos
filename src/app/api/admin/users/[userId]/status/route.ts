import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { serializeUser } from "@/lib/users/serialize-user";
import User from "@/models/User";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ userId: string }> };

const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "banned", "deactivated"]),
  adminPermissions: z.array(z.string()).max(20).optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");
    const { userId } = await context.params;
    const body = updateUserStatusSchema.parse(await request.json());
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (actor.role !== "super-admin" && user.role === "super-admin") {
      throw new ApiError(403, "Only a super admin can manage a super admin.");
    }

    user.status = body.status;
    user.isBanned = body.status === "banned";

    if (body.adminPermissions && actor.role === "super-admin") {
      user.adminPermissions = body.adminPermissions;
    }

    await user.save();

    return successResponse({
      message: "User status updated successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
