import Link from "next/link";
import {
  SuperAdminChrome,
  SuperAdminMetric,
  SuperAdminPanel,
  SuperAdminRow,
  SuperAdminTable,
} from "@/components/super-admin/SuperAdminChrome";
import { getSuperAdminAccessDashboard } from "@/lib/super-admin/dashboard";
import { requireSuperAdminPage } from "@/lib/super-admin/guard";

export const dynamic = "force-dynamic";

export default async function SuperAdminAccessPage() {
  await requireSuperAdminPage();
  const data = await getSuperAdminAccessDashboard();

  return (
    <SuperAdminChrome title="Access Control" eyebrow="Super Admin / Access">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.roles.map((role) => (
          <SuperAdminMetric
            key={role._id ?? "unknown"}
            label="Role"
            value={role.count}
            detail={role._id ?? "unknown"}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SuperAdminPanel
          title="Recent Users"
          action={<Link href="/admin/users" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Open Users</Link>}
        >
          <SuperAdminTable>
            {data.recentUsers.map((user) => (
              <SuperAdminRow
                key={user._id.toString()}
                title={user.name}
                meta={`${user.email} / ${user.role} / ${user.ageTrack}`}
                value={user.status}
              />
            ))}
          </SuperAdminTable>
        </SuperAdminPanel>

        <SuperAdminPanel
          title="Open Admin Invites"
          action={<Link href="/admin/invites" className="rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-bold !text-[#202020] hover:border-[#8c0504]">Create Invite</Link>}
        >
          <SuperAdminTable>
            {data.openInvites.length ? data.openInvites.map((invite) => (
              <SuperAdminRow
                key={invite._id.toString()}
                title={invite.email}
                meta={`Expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                value={invite.role}
              />
            )) : <p className="text-sm text-[#555]">No open admin invites.</p>}
          </SuperAdminTable>
        </SuperAdminPanel>
      </div>

      <div className="mt-6">
        <SuperAdminPanel title="Account Status Mix">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.statuses.map((status) => (
              <SuperAdminMetric
                key={status._id ?? "unknown"}
                label="Status"
                value={status.count}
                detail={status._id ?? "unknown"}
              />
            ))}
          </div>
        </SuperAdminPanel>
      </div>
    </SuperAdminChrome>
  );
}
