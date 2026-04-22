import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { loginSchema } from "@/lib/validation/auth";
import User from "@/models/User";
import { signAuthToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());

    await connectToDatabase();

    const user = await User.findOne({ email: body.email }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (user.isBanned) {
      throw new ApiError(403, "This account has been banned.");
    }

    const passwordMatches = await user.comparePassword(body.password);

    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = await signAuthToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = successResponse({
      message: "Login successful.",
      user: serializeUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
