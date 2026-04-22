import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { registerSchema } from "@/lib/validation/auth";
import User from "@/models/User";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { serializeUser } from "@/lib/users/serialize-user";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { hashPassword } from "@/lib/auth/password";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
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
      ageTrack: body.ageTrack ?? deriveAgeTrack(body.age),
      interests: body.interests ?? [],
      emailVerifiedAt: new Date(),
      status: "active",
    });

    await queueEmail({
      template: body.role === "subscriber" ? "subscriber-welcome" : "mentee-welcome",
      recipient: user.email,
      payload: {
        name: user.name,
        role: user.role,
      },
    });

    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = successResponse(
      {
        message: "Registration successful.",
        user: serializeUser(user),
      },
      { status: 201 },
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
