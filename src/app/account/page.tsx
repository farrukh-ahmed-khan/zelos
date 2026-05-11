import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlayCircleFilled } from "@ant-design/icons";
import { AccountSettingsForm } from "@/components/AccountSettingsForm";
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
      <section className="container">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex h-12 items-center gap-3 rounded-sm bg-white px-4 text-2xl font-bold !text-[#343434] shadow-[0_3px_0_rgba(0,0,0,0.18)]">
            <span className="grid h-8 w-8 place-items-center text-[#ff3038]">
              <PlayCircleFilled className="text-[22px]" />
            </span>
            Zelos
          </Link>
          <Link href="/dashboard" className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
            Dashboard
          </Link>
        </header>

        <div className="mx-auto max-w-[860px]">
          <p className="font-bebas text-sm uppercase text-[#b22222]">Account</p>
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
