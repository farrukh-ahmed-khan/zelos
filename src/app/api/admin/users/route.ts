import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { requireAdminPermission } from "@/lib/auth/session";
import { resolveSubscriptionAccessFromDocument } from "@/lib/subscriptions/service";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    await connectToDatabase();

    const role = request.nextUrl.searchParams.get("role");
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select("name email role age ageTrack parentId schoolId isBanned status forumPostingRevoked adminPermissions createdAt updatedAt")
      .lean();
    const userIds = users.map((user) => user._id.toString());
    const subscriptions = await Subscription.find({ userId: { $in: userIds } })
      .sort({ userId: 1, createdAt: -1 });
    const latestSubscriptionByUserId = new Map<string, (typeof subscriptions)[number]>();

    for (const subscription of subscriptions) {
      if (!latestSubscriptionByUserId.has(subscription.userId)) {
        latestSubscriptionByUserId.set(subscription.userId, subscription);
      }
    }

    return successResponse({
      count: users.length,
      users: users.map((user) => {
        const resolved = resolveSubscriptionAccessFromDocument(
          latestSubscriptionByUserId.get(user._id.toString()) ?? null,
        );

        return {
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
          hasPremiumAccess: resolved.hasPremiumAccess,
          subscriptionStatus: resolved.effectiveStatus,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
