import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminInviteAcceptForm } from "@/components/AdminInviteAcceptForm";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminInvitesManager } from "@/components/admin/AdminInvitesManager";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import AdminInvite from "@/models/AdminInvite";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const tokenParam = (await searchParams).token;

  if (tokenParam) {
    return (
      <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
        <section className="container max-w-[720px] py-12">
          <p className="eyebrow-red">Invite</p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Create Admin Account</h1>
          <div className="mt-6">
            <AdminInviteAcceptForm token={tokenParam} />
          </div>
        </section>
      </main>
    );
  }

  const authToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!authToken) redirect("/login");
  const payload = await verifyAuthToken(authToken).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const actor = await User.findById(payload.sub);
  if (!actor || !hasAdminPermission(actor.role, actor.adminPermissions, "users.manage-limited")) {
    redirect("/dashboard");
  }

  const invites = await AdminInvite.find()
    .sort({ createdAt: -1 })
    .select("email role adminPermissions expiresAt usedAt createdAt")
    .lean();

  return (
    <AdminChrome title="Admin Invites" eyebrow="Admin / Access" isSuperAdmin={actor.role === "super-admin"} adminRole={actor.role} adminPermissions={actor.adminPermissions ?? []}>
      <AdminInvitesManager invites={JSON.parse(JSON.stringify(invites.map((invite) => ({
        id: invite._id.toString(),
        email: invite.email,
        role: invite.role,
        adminPermissions: invite.adminPermissions ?? [],
        expiresAt: invite.expiresAt,
        usedAt: invite.usedAt ?? null,
        createdAt: invite.createdAt,
      }))))} />
    </AdminChrome>
  );
}
