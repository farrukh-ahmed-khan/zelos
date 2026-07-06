import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getActiveScholarships,
  getScholarshipDonationTotals,
  serializeScholarship,
} from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  const scholarships = (await getActiveScholarships()).map(serializeScholarship);
  const donationTotals = await getScholarshipDonationTotals(
    scholarships.map((scholarship) => scholarship.id),
  );

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container my-12">
        <p className="eyebrow-red">Scholarships</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Active Scholarships</h1>
        <Link href="/fund-a-scholarship" className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
          Fund a scholarship
        </Link>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => {
            const donationTotal = donationTotals.get(scholarship.id) ?? 0;
            return (
            <article key={scholarship.id} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
              <Link href={`/scholarships/${scholarship.slug}`} className="!text-[#202020]">
              <p className="text-xs font-black uppercase text-[#b22222]">{scholarship.field}</p>
              <h2 className="font-bebas text-3xl uppercase leading-none">{scholarship.name}</h2>
              <p className="mt-3 text-sm font-bold">${(scholarship.awardAmountCents / 100).toLocaleString()} award</p>
              <p className="text-sm font-bold text-[#24551f]">
                ${(donationTotal / 100).toLocaleString()} donated by the community
              </p>
              <p className="text-sm text-[#667085]">{scholarship.numberOfRecipients} recipient{scholarship.numberOfRecipients === 1 ? "" : "s"}</p>
              <p className="mt-2 text-xs font-black uppercase text-[#8c0504]">
                Deadline {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(scholarship.applicationDeadline))}
              </p>
              </Link>
              <Link href={`/donate?scholarship=${scholarship.slug}`} className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]">
                Donate to this scholarship
              </Link>
            </article>
          )})}
        </div>
      </section>
      <Footer />
    </main>
  );
}
