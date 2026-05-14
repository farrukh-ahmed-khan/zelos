import { AuthPageShell } from "@/components/AuthPageShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";

export default async function SignupPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifyAuthToken(token).catch(() => null);

    if (payload) {
      redirect("/dashboard");
    }
  }

  return <AuthPageShell mode="signup" />;
}
