import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { serializeUser } from "@/lib/users/serialize-user";
import User from "@/models/User";

export const runtime = "nodejs";

const updateChildSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.email().trim().toLowerCase().optional(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number.",
    )
    .optional(),
});

type RouteContext = {
  params: Promise<{
    childId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const parent = await requireUser(request, ["parent"]);
    const { childId } = await context.params;
    const body = updateChildSchema.parse(await request.json());

    await connectToDatabase();

    const child = await User.findOne({
      _id: childId,
      role: "child",
      parentId: parent._id.toString(),
    }).select("+password");

    if (!child) {
      throw new ApiError(404, "Learner profile not found.");
    }

    if (body.email && body.email !== child.email) {
      const existing = await User.findOne({ email: body.email });

      if (existing) {
        throw new ApiError(409, "An account with this email already exists.");
      }

      child.email = body.email;
      child.emailVerifiedAt = new Date();
      child.pendingEmail = null;
    }

    if (body.name) {
      child.name = body.name;
    }

    if (body.password) {
      child.password = await hashPassword(body.password);
    }

    await child.save();

    return successResponse({
      message: "Learner profile updated.",
      child: serializeUser(child),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
