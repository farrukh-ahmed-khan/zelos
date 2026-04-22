import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ADMIN_ROLES);
    await connectToDatabase();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email role age ageTrack parentId schoolId isBanned createdAt updatedAt")
      .lean();

    return successResponse({
      count: users.length,
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        ageTrack: user.ageTrack,
        parentId: user.parentId ?? null,
        schoolId: user.schoolId ?? null,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
