import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonPostForm } from "@/components/JsonPostForm";
import { getScholarshipByIdOrSlug, serializeScholarship } from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarshipDoc = await getScholarshipByIdOrSlug(id);

  if (!scholarshipDoc) {
    notFound();
  }

  const scholarship = serializeScholarship(scholarshipDoc);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12 max-w-[1040px]">
        <p className="eyebrow-red">
          {scholarship.field}
        </p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          {scholarship.name}
        </h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {scholarship.description}
            </p>
            <h2 className="mt-5 font-bebas text-3xl uppercase">Eligibility</h2>
            <p className="text-sm leading-relaxed">{scholarship.eligibility}</p>
            <div className="mt-5 h-4 rounded-full bg-[#eee6d6]">
              <div
                className="h-full rounded-full bg-[#b22222]"
                style={{ width: `${scholarship.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 font-bold">
              ${(scholarship.liveFundCents / 100).toLocaleString()} live fund total
            </p>
          </article>

          <div className="grid gap-5">
            <JsonPostForm
              endpoint={`/api/scholarships/${scholarship.id}/apply`}
              submitLabel="Apply"
              fields={[
                { name: "name", label: "Full name" },
                { name: "email", label: "Email", type: "email" },
                { name: "school", label: "School" },
                { name: "fieldOfStudy", label: "Field of study" },
                { name: "gpa", label: "GPA", type: "number" },
                { name: "personalStatement", label: "Personal statement", textarea: true },
              ]}
            />
            <JsonPostForm
              endpoint={`/api/scholarships/${scholarship.id}/donate`}
              submitLabel="Donate"
              fields={[
                { name: "donorName", label: "Donor name" },
                { name: "donorEmail", label: "Email", type: "email" },
                { name: "amountCents", label: "Amount in cents", type: "number", value: "2500" },
              ]}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
