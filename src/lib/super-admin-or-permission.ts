import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission, type AdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function requireSuperOrPermission(permission: AdminPermission) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyAuthToken(token).catch(() => null);

  if (!payload?.sub) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(payload.sub);

  if (!user || !hasAdminPermission(user.role, user.adminPermissions, permission)) {
    redirect("/dashboard");
  }

  return user;
}
