import { AuthPageShell } from "@/components/AuthPageShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export default async function LoginPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifyAuthToken(token).catch(() => null);

    if (payload?.sub) {
      await connectToDatabase();
      const user = await User.findById(payload.sub);

      if (user?.emailVerifiedAt) {
        redirect("/dashboard");
      }
    } else if (payload) {
      redirect("/dashboard");
    }
  }

  return <AuthPageShell mode="login" />;
}
