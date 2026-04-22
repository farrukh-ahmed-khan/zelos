import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { requireAdminPermission } from "@/lib/auth/session";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    await connectToDatabase();

    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("name email role age ageTrack parentId schoolId isBanned status forumPostingRevoked adminPermissions createdAt updatedAt")
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
        status: user.status ?? (user.isBanned ? "banned" : "active"),
        forumPostingRevoked: user.forumPostingRevoked ?? false,
        adminPermissions: user.adminPermissions ?? [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
