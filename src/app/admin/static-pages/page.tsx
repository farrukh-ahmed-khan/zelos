import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminStaticPagesManager } from "@/components/admin/AdminStaticPagesManager";
import { getStaticPages } from "@/lib/static-pages/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminStaticPagesPage() {
  const user = await requireSuperOrPermission("content.manage");
  const pages = await getStaticPages();

  return (
    <AdminChrome title="Static Pages" eyebrow="Admin / CMS" isSuperAdmin={user.role === "super-admin"} adminRole={user.role} adminPermissions={user.adminPermissions ?? []}>
      <AdminStaticPagesManager pages={JSON.parse(JSON.stringify(pages))} />
    </AdminChrome>
  );
}
