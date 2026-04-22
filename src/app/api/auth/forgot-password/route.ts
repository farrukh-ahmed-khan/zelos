import { randomBytes, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { handleApiError, successResponse } from "@/lib/http";
import User from "@/models/User";

export const runtime = "nodejs";

function buildResetUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return `${baseUrl}/reset-password?token=${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = forgotPasswordSchema.parse(await request.json());

    await connectToDatabase();

    const user = await User.findOne({ email: body.email }).select(
      "+resetPasswordToken +resetPasswordExpiresAt",
    );

    if (!user || user.isBanned) {
      return successResponse({
        message:
          "If an account exists for that email, a password reset token has been issued.",
      });
    }

    const resetToken = randomBytes(32).toString("hex");
    const hashedResetToken = createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    return successResponse({
      message:
        "If an account exists for that email, a password reset token has been issued.",
      ...(process.env.NODE_ENV !== "production"
        ? {
            resetToken,
            resetUrl: buildResetUrl(resetToken),
            expiresAt: user.resetPasswordExpiresAt,
          }
        : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
