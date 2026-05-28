import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminReportsManager } from "@/components/admin/AdminReportsManager";
import { getForumReports } from "@/lib/forum/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await requireSuperOrPermission("forum.moderate");
  const reports = await getForumReports();

  return (
    <AdminChrome title="Reports" eyebrow="Admin / Moderation" isSuperAdmin={user.role === "super-admin"}>
      <AdminReportsManager reports={JSON.parse(JSON.stringify(reports))} />
    </AdminChrome>
  );
}
