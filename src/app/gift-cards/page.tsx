import Link from "next/link";
import { CheckoutSuccessCleanup } from "@/components/CheckoutSuccessCleanup";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GiftCardExperience } from "./GiftCardExperience";

export const metadata = {
  title: "Zelos Gift Cards",
  description: "Send a digital Zelos gift card by email.",
};

function getParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const purchase = getParam(resolvedSearchParams, "purchase");

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-20 sm:px-6">
        <nav className="flex items-center gap-1.5 py-5 text-sm text-[#888]">
          <Link href="/" className="transition hover:text-[#b22222]">Home</Link>
          <span>/</span>
          <Link href="/store" className="transition hover:text-[#b22222]">Store</Link>
          <span>/</span>
          <span className="font-semibold text-[#202020]">Gift Cards</span>
        </nav>

        {purchase === "success" ? (
          <>
            <CheckoutSuccessCleanup />
            <div className="mb-7 rounded-xl border border-[#b7e4c7] bg-[#eef8e8] px-5 py-4 text-sm font-bold text-[#1a5c2e]">
              Payment confirmed. The gift-card code is being delivered to the recipient by email.
            </div>
          </>
        ) : null}

        <section className="mb-9 max-w-3xl">
          <p className="eyebrow-red">Give Something Meaningful</p>
          <h1 className="font-bebas text-[clamp(3.5rem,10vw,6.5rem)] uppercase leading-[0.84]">
            Zelos Gift Cards
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#666] sm:text-lg">
            Choose an amount, add a personal note, and send it to anyone. After secure Stripe
            payment, the recipient receives their unique code by email and can redeem it in the
            store or toward an eligible subscription checkout.
          </p>
        </section>

        <GiftCardExperience />

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Personalize", "Choose an amount and tell us who should receive it."],
            ["2", "Pay Securely", "Complete payment through the existing Stripe checkout."],
            ["3", "Delivered by Email", "We generate the code after payment and send it directly."],
          ].map(([number, title, copy]) => (
            <div key={number} className="rounded-xl border border-[#d8d2c5] bg-white p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#8c0504] text-sm font-black text-white">
                {number}
              </span>
              <h2 className="mt-4 font-bebas text-2xl uppercase">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#777]">{copy}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}
