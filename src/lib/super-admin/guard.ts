import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function requireSuperAdminPage() {
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

  if (!user || user.role !== "super-admin") {
    redirect("/dashboard");
  }

  return user;
}
