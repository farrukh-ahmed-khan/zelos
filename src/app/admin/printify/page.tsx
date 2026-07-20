import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminPrintifyManager } from "@/components/admin/AdminPrintifyManager";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminPrintifyPage() {
  const user = await requireSuperOrPermission("billing.read");

  return (
    <AdminChrome
      title="Printify"
      eyebrow="Admin / Store"
      isSuperAdmin={user.role === "super-admin"}
      adminRole={user.role}
      adminPermissions={user.adminPermissions ?? []}
    >
      <AdminPrintifyManager />
    </AdminChrome>
  );
}
