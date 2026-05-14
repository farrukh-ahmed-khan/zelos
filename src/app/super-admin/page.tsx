import Link from "next/link";
import {
  SuperAdminChrome,
  SuperAdminMetric,
  SuperAdminPanel,
  SuperAdminRow,
  SuperAdminTable,
} from "@/components/super-admin/SuperAdminChrome";
import { getSuperAdminOverview } from "@/lib/super-admin/dashboard";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

function dollars(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

const quickActions = [
  { href: "/admin/subscription-plans", label: "Manage Plans", detail: "Pricing, discounts, Stripe price IDs" },
  { href: "/admin/videos", label: "Manage Videos", detail: "Upload, sequence, drip, preview, mission video" },
  { href: "/admin/users", label: "Manage Users", detail: "Statuses, RBAC, deletion" },
  { href: "/admin/invites", label: "Invite Admins", detail: "Moderator and sub-admin links" },
];

export default async function SuperAdminPage() {
  await requireSuperAdminPage();
  const overview = await getSuperAdminOverview();

  return (
    <SuperAdminChrome title="Command Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetric label="Users" value={overview.users} detail={`${overview.activeUsers} active accounts`} />
        <SuperAdminMetric label="Subscribers" value={overview.subscribers} detail={`${overview.activeSubscriptions} active subscriptions`} />
        <SuperAdminMetric label="Revenue" value={dollars(overview.paidRevenueCents)} detail={`${overview.orders} store orders recorded`} />
        <SuperAdminMetric label="Operations" value={overview.openReports + overview.newForms + overview.pendingEmails} detail="Open reports, forms, and queued emails" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SuperAdminPanel title="Platform Health">
          <div className="grid gap-3 sm:grid-cols-2">
            <SuperAdminMetric label="Schools" value={overview.schools} detail="School license records" />
            <SuperAdminMetric label="Videos" value={overview.videos} detail="All audience libraries" />
            <SuperAdminMetric label="Plans" value={overview.plans} detail="Subscription plan records" />
            <SuperAdminMetric label="Open Invites" value={overview.invites} detail="Unclaimed admin invites" />
          </div>
        </SuperAdminPanel>

        <SuperAdminPanel title="Quick Actions">
          <div className="grid gap-3 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-md border border-[#d9dde3] bg-[#f8fafc] p-4 !text-[#202020] transition hover:border-[#8c0504] hover:bg-white"
              >
                <p className="text-sm font-black">{action.label}</p>
                <p className="mt-2 text-sm text-[#555]">{action.detail}</p>
              </Link>
            ))}
          </div>
        </SuperAdminPanel>
      </div>

      <div className="mt-6">
        <SuperAdminPanel title="Operational Queue">
          <SuperAdminTable>
            <SuperAdminRow title="Open forum reports" meta="Moderation items waiting for review" value={overview.openReports} />
            <SuperAdminRow title="New public forms" meta="Contact, school demo, scholarship, and data requests" value={overview.newForms} />
            <SuperAdminRow title="Pending emails" meta="Transactional outbox messages not sent yet" value={overview.pendingEmails} />
            <SuperAdminRow title="Canceled subscriptions" meta="Access remains until current paid period ends" value={overview.canceledSubscriptions} />
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>
    </SuperAdminChrome>
  );
}
