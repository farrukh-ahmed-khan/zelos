import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { getAdminAnalyticsOverview } from "@/lib/analytics/overview";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await requireSuperOrPermission("analytics.read");
  const data = await getAdminAnalyticsOverview();

  return (
    <AdminChrome title="Analytics" eyebrow="Admin / Analytics" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminAnalyticsDashboard data={JSON.parse(JSON.stringify(data))} />
    </AdminChrome>
  );
}
