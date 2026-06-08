import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { getProducts, serializeProduct } from "@/lib/store/service";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await requireSuperOrPermission("billing.read");
  const products = (await getProducts(true)).map((product) => serializeProduct(product));

  return (
    <AdminChrome title="Store Products" eyebrow="Admin / Store" isSuperAdmin={user.role === "super-admin"}>
      <AdminProductsManager products={JSON.parse(JSON.stringify(products))} />
    </AdminChrome>
  );
}
