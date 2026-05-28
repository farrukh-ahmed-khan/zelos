import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";
import { SuperAdminChrome } from "@/components/super-admin/SuperAdminChrome";
import { getAdminAnalyticsOverview } from "@/lib/analytics/overview";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

export default async function SuperAdminAnalyticsPage() {
  await requireSuperAdminPage();
  const data = await getAdminAnalyticsOverview();

  return (
    <SuperAdminChrome title="Analytics" eyebrow="Super Admin / Analytics">
      <AdminAnalyticsDashboard data={JSON.parse(JSON.stringify(data))} />
    </SuperAdminChrome>
  );
}
