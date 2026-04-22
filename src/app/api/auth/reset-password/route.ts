import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/validation/auth";
import User from "@/models/User";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { serializeUser } from "@/lib/users/serialize-user";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = resetPasswordSchema.parse(await request.json());

    await connectToDatabase();

    const hashedResetToken = createHash("sha256")
      .update(body.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpiresAt");

    if (!user) {
      throw new ApiError(400, "Password reset token is invalid or expired.");
    }

    if (user.isBanned) {
      throw new ApiError(403, "This account has been banned.");
    }

    user.password = await hashPassword(body.password);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = successResponse({
      message: "Password reset successful.",
      user: serializeUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
