import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminSchoolsManager } from "@/components/school/AdminSchoolsManager";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import School from "@/models/School";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  const user = await requireSuperOrPermission("schools.manage");
  const schools = await School.find().sort({ name: 1 }).lean();

  return (
    <AdminChrome title="Schools" eyebrow="Admin / Schools" isSuperAdmin={user.role === "super-admin"}>
      <AdminSchoolsManager schools={JSON.parse(JSON.stringify(schools.map((school) => ({
        id: school._id.toString(),
        name: school.name,
        licenseType: school.licenseType ?? "school",
        district: school.district ?? null,
        teacherLimit: school.teacherLimit,
        studentLimit: school.studentLimit,
        teachersCount: school.teachersCount,
        studentsCount: school.studentsCount,
        licenseStatus: school.licenseStatus,
        assignedTracks: school.assignedTracks ?? [],
      }))))} />
    </AdminChrome>
  );
}
