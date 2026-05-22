import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getActiveScholarships, serializeScholarship } from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  const scholarships = (await getActiveScholarships()).map(serializeScholarship);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12">
        <p className="eyebrow-red">Scholarships</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Active Scholarships</h1>
        <Link href="/fund-a-scholarship" className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
          Fund a scholarship
        </Link>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
              <p className="text-xs font-black uppercase text-[#b22222]">{scholarship.field}</p>
              <h2 className="font-bebas text-3xl uppercase leading-none">{scholarship.name}</h2>
              <p className="mt-3 text-sm font-bold">${(scholarship.awardAmountCents / 100).toLocaleString()} award</p>
              <p className="text-sm text-[#667085]">{scholarship.numberOfRecipients} recipient{scholarship.numberOfRecipients === 1 ? "" : "s"}</p>
              <p className="mt-2 text-xs font-black uppercase text-[#8c0504]">
                Deadline {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(scholarship.applicationDeadline))}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
