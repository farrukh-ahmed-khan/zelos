import { DonationCheckoutForm } from "@/components/DonationCheckoutForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[920px]">
        <p className="eyebrow-red">Zelos Mission</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Donate</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-md border-2 border-[#212121] bg-[#8c0504] p-5 text-white shadow-[0_4px_0_#111]">
            <h2 className="font-bebas text-3xl uppercase">Aiding Students</h2>
            <p className="mt-2 text-sm leading-relaxed">
              One-time gifts support one stated purpose: aiding students through Zelos programs.
            </p>
            <p className="mt-4 text-xs font-bold uppercase">
              501(c)(3) tax-deductible nonprofit. EIN: {process.env.NEXT_PUBLIC_NONPROFIT_EIN ?? "pending"}
            </p>
          </div>
          <DonationCheckoutForm />
        </div>
      </section>
      <Footer />
    </main>
  );
}
