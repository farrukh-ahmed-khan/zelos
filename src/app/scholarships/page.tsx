import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getActiveScholarships,
  getScholarshipDonationTotals,
  serializeScholarship,
} from "@/lib/scholarships/service";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function formatDeadline(value: string | Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

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
        {scholarships.length > 0 ? (
          <Link href="/fund-a-scholarship" className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111]">
            Fund a scholarship
          </Link>
        ) : null}
        {scholarships.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-md border-2 border-[#212121] bg-white text-center shadow-[0_6px_0_#111]">
            <div className="flex items-center justify-center gap-2 border-b-2 border-[#212121] bg-[#faff8d] px-6 py-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#b22222]" />
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#212121]">
                New opportunities are coming
              </p>
            </div>
            <div className="px-6 py-10 sm:px-10">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#212121] bg-[#eee6d6]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
                  <path d="M22 9 12 4 2 9l10 5 10-5Z" />
                  <path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
                </svg>
              </span>
              <h2 className="mt-5 font-bebas text-[clamp(1.9rem,4vw,2.75rem)] uppercase leading-none">
                No active scholarships right now
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#555]">
                Check back soon for new opportunities — or help create the next one for a deserving
                student.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/fund-a-scholarship"
                  className="inline-flex w-full justify-center rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  Fund a scholarship
                </Link>
                
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => {
              const donationTotal = donationTotals.get(scholarship.id) ?? 0;
              const runningTotal = scholarship.startingAmountCents + donationTotal;
              return (
                <article key={scholarship.id} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
                  <Link href={`/scholarships/${scholarship.slug}`} className="!text-[#202020]">
                    <p className="text-xs font-black uppercase text-[#b22222]">{scholarship.field}</p>
                    <h2 className="font-bebas text-3xl uppercase leading-none">{scholarship.name}</h2>
                    <dl className="mt-4 grid gap-3 text-sm">
                      <div>
                        <dt className="font-black uppercase text-[#8c0504]">Purpose</dt>
                        <dd className="line-clamp-3 leading-relaxed">{scholarship.description}</dd>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Starting fund amount</dt>
                          <dd>{money(scholarship.startingAmountCents)}</dd>
                        </div>
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Running total</dt>
                          <dd className="font-bold text-[#24551f]">{money(runningTotal)}</dd>
                        </div>
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Deadline</dt>
                          <dd>{formatDeadline(scholarship.applicationDeadline)}</dd>
                        </div>
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Award</dt>
                          <dd>{money(scholarship.awardAmountCents)} / {scholarship.numberOfRecipients} recipient{scholarship.numberOfRecipients === 1 ? "" : "s"}</dd>
                        </div>
                      </div>
                      <div>
                        <dt className="font-black uppercase text-[#8c0504]">Eligibility Criteria</dt>
                        <dd className="line-clamp-3 leading-relaxed">{scholarship.eligibility}</dd>
                      </div>
                    </dl>
                  </Link>
                  <Link href={`/donate?scholarship=${scholarship.slug}`} className="mt-4 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]">
                    Donate to this scholarship
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
