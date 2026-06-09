import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { registerSchema } from "@/lib/validation/auth";
import User from "@/models/User";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { serializeUser } from "@/lib/users/serialize-user";
import { hashPassword } from "@/lib/auth/password";
import { queueEmail } from "@/lib/notifications/service";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`register:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = registerSchema.parse(await request.json());

    await connectToDatabase();

    const existingUser = await User.findOne({ email: body.email });

    if (existingUser) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: await hashPassword(body.password),
      role: body.role,
      age: body.age,
      ageTrack: deriveAgeTrack(body.age),
      interests: body.interests ?? [],
      emailVerifiedAt: null,
      termsAcceptedAt: new Date(),
      termsVersion: body.termsVersion ?? "v1",
      status: "active",
    });

    const verification = await issueEmailVerification(user);

    await queueEmail({
      template: body.role === "subscriber" ? "welcome-subscriber" : "welcome-mentee",
      recipient: user.email,
      payload: {
        name: user.name,
        role: user.role,
      },
    });

    return successResponse(
      {
        message: "Registration successful. Please verify your email before signing in.",
        user: serializeUser(user),
        ...(process.env.NODE_ENV !== "production" ? verification : {}),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
