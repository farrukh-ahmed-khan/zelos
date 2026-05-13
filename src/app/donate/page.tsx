import { JsonPostForm } from "@/components/JsonPostForm";
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
            <h2 className="font-bebas text-3xl uppercase">Where Your Money Goes</h2>
            <p className="mt-2 text-sm leading-relaxed">Content creation, mentoring programs, community events, and scholarship support. 501(c)(3) disclosure and EIN can be shown here once David provides final nonprofit details.</p>
          </div>
          <JsonPostForm
            endpoint="/api/donations"
            submitLabel="Record Donation"
            fields={[
              { name: "amountCents", label: "Amount in cents", type: "number", value: "2500" },
              { name: "firstName", label: "First name" },
              { name: "lastName", label: "Last name" },
              { name: "email", label: "Email", type: "email" },
              { name: "dedication", label: "Dedication" },
            ]}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
