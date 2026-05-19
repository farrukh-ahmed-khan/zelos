import Link from "next/link";
import {
  SuperAdminChrome,
  SuperAdminMetric,
  SuperAdminPanel,
  SuperAdminRow,
  SuperAdminTable,
} from "@/components/super-admin/SuperAdminChrome";
import { getSuperAdminBillingDashboard } from "@/lib/super-admin/dashboard";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

function money(cents: number, currency = "USD") {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency,
  });
}

export default async function SuperAdminBillingPage() {
  await requireSuperAdminPage();
  const data = await getSuperAdminBillingDashboard();

  return (
    <SuperAdminChrome title="Billing Control" eyebrow="Super Admin / Billing">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetric label="Plans" value={data.plans.length} detail="Monthly, annual, promo" />
        {data.subscriptionStatuses.map((status) => (
          <SuperAdminMetric key={status._id ?? "unknown"} label="Subscriptions" value={status.count} detail={status._id ?? "unknown"} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel
          title="Plan Catalog"
          action={<Link href="/admin/subscription-plans" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Manage Plans</Link>}
        >
          <SuperAdminTable>
            {data.plans.map((plan) => (
              <SuperAdminRow
                key={plan._id.toString()}
                title={plan.name}
                meta={`${plan.interval} / ${plan.isActive ? "active" : "inactive"}`}
                value={money(plan.priceCents, plan.currency.toUpperCase())}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>

        <SuperAdminPanel title="Recent Subscriptions">
          <SuperAdminTable>
            {data.subscriptions.length ? data.subscriptions.map((subscription) => (
              <SuperAdminRow
                key={subscription._id.toString()}
                title={`${subscription.planType} subscription`}
                meta={`User ${subscription.userId} / ends ${new Date(subscription.expiryDate).toLocaleDateString()}`}
                value={subscription.status}
              />
            )) : <p className="text-sm text-[#555]">No subscriptions recorded.</p>}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel title="Store Products">
          <SuperAdminTable>
            {data.products.map((product) => (
              <SuperAdminRow
                key={product._id.toString()}
                title={product.name}
                meta={`Inventory ${product.inventoryCount} / ${product.isActive ? "active" : "inactive"}`}
                value={money(product.priceCents)}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>

        <SuperAdminPanel title="Recent Orders">
          <SuperAdminTable>
            {data.orders.length ? data.orders.map((order) => (
              <SuperAdminRow
                key={order._id.toString()}
                title={order.email}
                meta={`${order.status} / ${new Date(order.createdAt).toLocaleDateString()}`}
                value={money(order.totalCents)}
              />
            )) : <p className="text-sm text-[#555]">No orders recorded.</p>}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>
    </SuperAdminChrome>
  );
}
