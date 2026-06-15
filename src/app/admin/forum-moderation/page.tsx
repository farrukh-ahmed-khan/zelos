import { AdminChrome } from "@/components/admin/AdminChrome";
import { ForumModerationManager } from "@/components/forum/ForumModerationManager";
import { getAdminForumCategories, getForumReports } from "@/lib/forum/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminForumModerationPage() {
  const user = await requireSuperOrPermission("forum.moderate");
  const [reports, categories] = await Promise.all([
    getForumReports(),
    getAdminForumCategories(),
  ]);

  return (
    <AdminChrome title="Forum Moderation" eyebrow="Admin / Community" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <ForumModerationManager
        categories={JSON.parse(JSON.stringify(categories))}
        reports={JSON.parse(JSON.stringify(reports))}
      />
    </AdminChrome>
  );
}
