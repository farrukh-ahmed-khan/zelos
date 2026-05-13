import Link from "next/link";
import { getActiveScholarships, serializeScholarship } from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

export default async function ScholarshipsPage() {
  const scholarships = (await getActiveScholarships()).map(serializeScholarship);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <section className="container">
        <p className="eyebrow-red">Scholarships</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Active Scholarships</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <Link key={scholarship.id} href={`/scholarships/${scholarship.slug}`} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
              <p className="text-xs font-black uppercase text-[#b22222]">{scholarship.field}</p>
              <h2 className="font-bebas text-3xl uppercase leading-none">{scholarship.name}</h2>
              <div className="mt-3 h-3 rounded-full bg-[#eee6d6]"><div className="h-full rounded-full bg-[#b22222]" style={{ width: `${scholarship.progressPercent}%` }} /></div>
              <p className="mt-2 text-sm font-bold">${(scholarship.liveFundCents / 100).toLocaleString()} funded</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
