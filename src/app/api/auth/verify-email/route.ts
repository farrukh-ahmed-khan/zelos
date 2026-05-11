import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { verifyEmailSchema } from "@/lib/validation/auth";
import { verifyEmailToken } from "@/lib/auth/email-verification";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = verifyEmailSchema.parse(await request.json());

    await connectToDatabase();

    const user = await verifyEmailToken(body.token);

    if (!user) {
      throw new ApiError(400, "Email verification token is invalid or expired.");
    }

    return successResponse({
      message: "Email verified successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
