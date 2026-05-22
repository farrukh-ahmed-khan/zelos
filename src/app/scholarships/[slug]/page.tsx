import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScholarshipApplicationForm } from "@/components/ScholarshipApplicationForm";
import { getScholarshipBySlug, serializeScholarship } from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scholarshipDoc = await getScholarshipBySlug(slug);
  if (!scholarshipDoc) notFound();
  const scholarship = serializeScholarship(scholarshipDoc);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[1040px]">
        <p className="eyebrow-red">{scholarship.field}</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">{scholarship.name}</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{scholarship.description}</p>
            <h2 className="mt-5 font-bebas text-3xl uppercase">Eligibility</h2>
            <p className="text-sm leading-relaxed">{scholarship.eligibility}</p>
            <h2 className="mt-5 font-bebas text-3xl uppercase">Selection Criteria</h2>
            <p className="text-sm leading-relaxed">{scholarship.selectionCriteria}</p>
            <dl className="mt-5 grid gap-3 rounded-md bg-[#f7f1e7] p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-black uppercase text-[#8c0504]">Award</dt>
                <dd>${(scholarship.awardAmountCents / 100).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="font-black uppercase text-[#8c0504]">Recipients</dt>
                <dd>{scholarship.numberOfRecipients}</dd>
              </div>
              <div>
                <dt className="font-black uppercase text-[#8c0504]">Deadline</dt>
                <dd>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(scholarship.applicationDeadline))}</dd>
              </div>
            </dl>
          </article>
          <div className="grid gap-5">
            <ScholarshipApplicationForm
              endpoint={`/api/scholarships/${scholarship.id}/apply`}
              requiresDocument={scholarship.applicationRequiresDocument}
              documentLabel={scholarship.applicationDocumentLabel}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
