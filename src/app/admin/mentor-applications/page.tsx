import { AdminMentorApplicationsClient } from "@/components/admin/AdminMentorApplicationsClient";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminMentorApplicationsPage() {
  const user = await requireSuperOrPermission("users.manage-limited");

  return (
    <AdminMentorApplicationsClient
      adminRole={user.role}
      adminPermissions={user.adminPermissions ?? []}
    />
  );
}
