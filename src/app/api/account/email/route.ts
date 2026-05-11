import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { updateEmailSchema } from "@/lib/validation/auth";
import User from "@/models/User";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = updateEmailSchema.parse(await request.json());

    await connectToDatabase();

    const existingUser = await User.findOne({ email: body.email });

    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    user.pendingEmail = body.email;
    user.emailVerifiedAt = null;
    const verification = await issueEmailVerification(user);

    return successResponse({
      message: "Verification email sent to the new address.",
      ...(process.env.NODE_ENV !== "production" ? verification : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
