import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { AdminOrdersManager } from "@/components/admin/AdminOrdersManager";
import { requireSuperOrPermission } from "@/lib/super-admin-or-permission";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await requireSuperOrPermission("billing.read");
  await connectToDatabase();
  const [orders, products] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).lean(),
    Product.find().sort({ createdAt: -1 }).lean(),
  ]);

  const serializedOrders = orders.map((order) => ({
    id: order._id.toString(),
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      size: item.size ?? null,
      color: item.color ?? null,
    })),
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents ?? 0,
    totalCents: order.totalCents,
    giftCardCode: order.giftCardCode ?? null,
    status: order.status,
    createdAt: order.createdAt,
  }));

  return (
    <AdminChrome title="Store Orders" eyebrow="Admin / Store" isSuperAdmin={user.role === "super-admin"}>
      <AdminPanel title="Order Management">
        <AdminOrdersManager
          orders={JSON.parse(JSON.stringify(serializedOrders))}
          products={JSON.parse(JSON.stringify(products.map((product) => ({
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceCents: product.priceCents,
            images: product.images ?? [],
            sizes: product.sizes ?? [],
            colors: product.colors ?? [],
            inventoryCount: product.inventoryCount,
            limitedEdition: product.limitedEdition,
            isActive: product.isActive,
            isGiftCard: product.isGiftCard,
          }))))}
        />
      </AdminPanel>
    </AdminChrome>
  );
}
