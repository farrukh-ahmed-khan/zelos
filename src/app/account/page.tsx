import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/AccountSettingsForm";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { serializeUser } from "@/lib/users/serialize-user";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
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

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <Header />
      <section className="container mt-12">
        <div className="mx-auto max-w-[860px]">
          <p className="eyebrow-red">Account</p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
            Settings
          </h1>
          <div className="mt-6">
            <AccountSettingsForm user={serializeUser(user)} />
          </div>
        </div>
      </section>
    </main>
  );
}
