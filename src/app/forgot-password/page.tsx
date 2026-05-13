import { TokenActionForm } from "@/components/TokenActionForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ForgotPasswordPage() {
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
