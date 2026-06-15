import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminEventsManager } from "@/components/admin/AdminEventsManager";
import { getAdminEvents } from "@/lib/events/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const user = await requireSuperOrPermission("events.manage");
  const events = await getAdminEvents();

  return (
    <AdminChrome title="Events" eyebrow="Admin / Events" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminEventsManager events={JSON.parse(JSON.stringify(events))} />
    </AdminChrome>
  );
}
