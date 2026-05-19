import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import User from "@/models/User";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "users.manage-limited");
    const { userId } = await context.params;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (actor.role !== "super-admin" && user.role === "super-admin") {
      throw new ApiError(403, "Only a super admin can manage a super admin.");
    }

    if (user.emailVerifiedAt) {
      throw new ApiError(409, "This user's email is already verified.");
    }

    await issueEmailVerification(user);

    return successResponse({
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
