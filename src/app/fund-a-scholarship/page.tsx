import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonPostForm } from "@/components/JsonPostForm";

export default function FundScholarshipPage() {
  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mb-24 mt-12 max-w-[980px]">
        <p className="eyebrow-red">Scholarship Funding</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Fund a Scholarship
        </h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <h2 className="font-bebas text-3xl uppercase">Lead Form Only</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Zelos reviews scholarship concepts offline. Submitting this form does not create a
              public listing, collect funds, or process payment.
            </p>
          </div>
          <JsonPostForm
            endpoint="/api/forms/scholarship-inquiry"
            submitLabel="Send scholarship concept"
            submittingLabel="Sending scholarship concept..."
            fields={[
              { name: "name", label: "Full name", required: true },
              { name: "email", label: "Email address", type: "email", required: true },
              { name: "contact", label: "Best contact method", required: true },
              { name: "scholarshipConcept", label: "Scholarship concept", textarea: true, required: true },
              { name: "intendedAudience", label: "Intended audience", required: true },
              { name: "budgetRange", label: "Budget range", required: true },
              { name: "notes", label: "Notes", textarea: true },
              { name: "companyWebsite", label: "", type: "hidden" },
            ]}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}
