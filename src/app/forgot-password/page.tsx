import { TokenActionForm } from "@/components/TokenActionForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";

export default async function ForgotPasswordPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifyAuthToken(token).catch(() => null);

    if (payload) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-16 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[720px]">
        <p className="eyebrow-red">Password</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Reset Request
        </h1>
        <div className="mt-6">
          <TokenActionForm endpoint="/api/auth/forgot-password" mode="forgot-password" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
