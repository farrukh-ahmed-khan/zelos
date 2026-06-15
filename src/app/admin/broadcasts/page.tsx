import { AdminBroadcastsClient } from "@/components/admin/AdminBroadcastsClient";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastsPage() {
  const user = await requireSuperOrPermission("content.manage");

  return (
    <AdminBroadcastsClient
      adminRole={user.role}
      adminPermissions={user.adminPermissions ?? []}
    />
  );
}
