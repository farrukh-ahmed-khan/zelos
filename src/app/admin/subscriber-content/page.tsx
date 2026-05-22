import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminSubscriberResourcesManager } from "@/components/subscriber/AdminSubscriberResourcesManager";
import {
  getSubscriberResourcesForAdmin,
  serializeSubscriberResource,
} from "@/lib/subscriber-resources/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminSubscriberContentPage() {
  const user = await requireSuperOrPermission("content.manage");
  const resources = await getSubscriberResourcesForAdmin();

  return (
    <AdminChrome title="Subscriber Content Library" eyebrow="Admin / Subscriber CMS" isSuperAdmin={user.role === "super-admin"}>
      <AdminSubscriberResourcesManager
        resources={JSON.parse(JSON.stringify(resources.map(serializeSubscriberResource)))}
      />
    </AdminChrome>
  );
}
