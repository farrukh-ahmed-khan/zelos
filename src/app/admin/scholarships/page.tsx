import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminScholarshipsManager } from "@/components/admin/AdminScholarshipsManager";
import { getAdminScholarships, getScholarshipApplicationsByListing } from "@/lib/scholarships/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminScholarshipsPage() {
  const user = await requireSuperOrPermission("users.manage-limited");
  const [scholarships, applications] = await Promise.all([
    getAdminScholarships(),
    getScholarshipApplicationsByListing(),
  ]);

  return (
    <AdminChrome title="Scholarships" eyebrow="Admin / Scholarships" isSuperAdmin={user.role === "super-admin"}>
      <AdminScholarshipsManager
        scholarships={JSON.parse(JSON.stringify(scholarships))}
        applications={JSON.parse(JSON.stringify(applications))}
      />
    </AdminChrome>
  );
}
