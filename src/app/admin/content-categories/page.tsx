import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminContentCategoriesManager } from "@/components/admin/AdminContentCategoriesManager";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import ContentCategory from "@/models/ContentCategory";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminContentCategoriesPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login");
  const payload = await verifyAuthToken(token).catch(() => null);
  if (!payload?.sub) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(payload.sub);
  if (!user || !hasAdminPermission(user.role, user.adminPermissions, "content.manage")) {
    redirect("/dashboard");
  }

  const categories = await ContentCategory.find()
    .sort({ audience: 1, ageTrack: 1, order: 1, name: 1 })
    .lean();

  return (
    <AdminChrome title="Content Categories" eyebrow="Admin / Content" isSuperAdmin={user.role === "super-admin"}>
      <AdminContentCategoriesManager categories={JSON.parse(JSON.stringify(categories))} />
    </AdminChrome>
  );
}
