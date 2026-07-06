import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { updatePasswordSchema } from "@/lib/validation/auth";
import User from "@/models/User";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireUser(request);
    if (authUser.role === "child") {
      throw new ApiError(403, "Child account password is managed by the account owner.");
    }
    const body = updatePasswordSchema.parse(await request.json());

    const user = await User.findById(authUser._id).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const currentPasswordMatches = await verifyPassword(
      body.currentPassword,
      user.password,
    );

    if (!currentPasswordMatches) {
      throw new ApiError(401, "Current password is incorrect.");
    }

    user.password = await hashPassword(body.password);
    await user.save();

    return successResponse({
      message: "Password updated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
