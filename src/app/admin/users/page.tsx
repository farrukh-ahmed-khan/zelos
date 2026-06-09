import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import { resolveSubscriptionAccessFromDocument } from "@/lib/subscriptions/service";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const actor = await User.findById(payload.sub);
  if (!actor || !hasAdminPermission(actor.role, actor.adminPermissions, "users.manage-limited")) {
    redirect("/dashboard");
  }

  const users = await User.find()
    .sort({ createdAt: -1 })
    .select("name email role ageTrack status adminPermissions emailVerifiedAt")
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

  const serializedUsers = users.map((user) => {
    const resolved = resolveSubscriptionAccessFromDocument(
      latestSubscriptionByUserId.get(user._id.toString()) ?? null,
    );

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      ageTrack: user.ageTrack,
      status: user.status,
      adminPermissions: user.adminPermissions ?? [],
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      hasPremiumAccess: resolved.hasPremiumAccess,
      subscriptionStatus: resolved.effectiveStatus,
    };
  });

  return (
    <AdminChrome title="Users & Roles" eyebrow="Admin / Access" isSuperAdmin={actor.role === "super-admin"}>
      <AdminUsersManager users={JSON.parse(JSON.stringify(serializedUsers))} />
    </AdminChrome>
  );
}
