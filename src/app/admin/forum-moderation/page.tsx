import { AdminChrome } from "@/components/admin/AdminChrome";
import { ForumModerationManager } from "@/components/forum/ForumModerationManager";
import { getForumReports } from "@/lib/forum/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminForumModerationPage() {
  const user = await requireSuperOrPermission("forum.moderate");
  const reports = await getForumReports();

  return (
    <AdminChrome title="Forum Moderation" eyebrow="Admin / Community" isSuperAdmin={user.role === "super-admin"}>
      <ForumModerationManager reports={JSON.parse(JSON.stringify(reports))} />
    </AdminChrome>
  );
}
