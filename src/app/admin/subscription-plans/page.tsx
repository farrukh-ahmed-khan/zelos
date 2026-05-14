import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminSubscriptionPlansManager } from "@/components/admin/AdminSubscriptionPlansManager";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import { getSubscriptionPlans, serializeSubscriptionPlan } from "@/lib/subscription-plans/service";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionPlansPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user || !hasAdminPermission(user.role, user.adminPermissions, "billing.read")) {
    redirect("/dashboard");
  }

  const plans = (await getSubscriptionPlans(true)).map(serializeSubscriptionPlan);

  return (
    <AdminChrome title="Subscription Plans" eyebrow="Admin / Billing" isSuperAdmin={user.role === "super-admin"}>
      <AdminSubscriptionPlansManager plans={JSON.parse(JSON.stringify(plans))} />
    </AdminChrome>
  );
}
