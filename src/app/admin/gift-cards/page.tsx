import { AdminGiftCardsClient } from "@/components/admin/AdminGiftCardsClient";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminGiftCardsPage() {
  const user = await requireSuperOrPermission("billing.read");

  return (
    <AdminGiftCardsClient
      adminRole={user.role}
      adminPermissions={user.adminPermissions ?? []}
    />
  );
}
