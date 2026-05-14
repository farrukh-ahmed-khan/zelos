import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminToolkitManager } from "@/components/toolkit/AdminToolkitManager";
import { getToolkitResourcesForAdmin, serializeToolkitResource } from "@/lib/toolkit/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminToolkitPage() {
  const user = await requireSuperOrPermission("content.manage");
  const resources = (await getToolkitResourcesForAdmin()).map((resource) =>
    serializeToolkitResource(resource),
  );

  return (
    <AdminChrome title="Money Toolkit" eyebrow="Admin / Downloadables" isSuperAdmin={user.role === "super-admin"}>
      <AdminToolkitManager resources={JSON.parse(JSON.stringify(resources))} />
    </AdminChrome>
  );
}
