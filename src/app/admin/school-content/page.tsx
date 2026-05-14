import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminSchoolResourcesManager } from "@/components/school/AdminSchoolResourcesManager";
import { getSchoolResourcesForAdmin, serializeSchoolResource } from "@/lib/school-resources/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminSchoolContentPage() {
  const user = await requireSuperOrPermission("content.manage");
  const resources = (await getSchoolResourcesForAdmin()).map(serializeSchoolResource);

  return (
    <AdminChrome title="School Content Library" eyebrow="Admin / School CMS" isSuperAdmin={user.role === "super-admin"}>
      <AdminSchoolResourcesManager resources={JSON.parse(JSON.stringify(resources))} />
    </AdminChrome>
  );
}
