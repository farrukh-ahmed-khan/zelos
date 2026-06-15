import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminSchoolResourcesManager } from "@/components/school/AdminSchoolResourcesManager";
import { getSchoolResourcesForAdmin, serializeSchoolResource } from "@/lib/school-resources/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import School from "@/models/School";

export const dynamic = "force-dynamic";

export default async function AdminSchoolContentPage() {
  const user = await requireSuperOrPermission("content.manage");
  const [resources, schools] = await Promise.all([
    getSchoolResourcesForAdmin(),
    School.find()
      .sort({ name: 1 })
      .select("name district licenseStatus")
      .lean(),
  ]);

  return (
    <AdminChrome title="School Content Library" eyebrow="Admin / School CMS" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminSchoolResourcesManager
        resources={JSON.parse(JSON.stringify(resources.map(serializeSchoolResource)))}
        schools={JSON.parse(JSON.stringify(schools.map((school) => ({
          id: school._id.toString(),
          name: school.name,
          district: school.district ?? null,
          licenseStatus: school.licenseStatus,
        }))))}
      />
    </AdminChrome>
  );
}
