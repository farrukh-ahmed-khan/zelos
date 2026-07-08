import Image from "next/image";
import Link from "next/link";
import { getActiveScholarships, getScholarshipDonationTotals, serializeScholarship } from "@/lib/scholarships/service";

const fallbackImages = [
  "/assets/future-leader.png",
  "/assets/young-economist.png",
  "/assets/community-builder.png",
];

function money(cents: number) {
  return `$${(cents / 100).toLocaleString()}`;
}

function formatDeadline(value: string | Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export async function ActiveScholarships() {
  const scholarships = (await getActiveScholarships(true)).map(serializeScholarship).slice(0, 3);
  const donationTotals = await getScholarshipDonationTotals(scholarships.map((scholarship) => scholarship.id));

  if (!scholarships.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#8c0504] px-4 py-20 text-white sm:px-6 lg:py-24">
      <div className="absolute inset-x-0 top-0 z-10 h-12 rounded-b-[2rem] bg-[#eee6d6]" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-16 rounded-t-[2rem] bg-[#eee6d6]" />
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.28)_0_1px,transparent_2px),linear-gradient(135deg,transparent_0_48%,rgba(255,255,255,0.18)_49%_51%,transparent_52%)] [background-size:88px_88px,140px_140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(202,27,18,0.8),rgba(63,0,0,0.92)_78%)]" />

      <div className="container relative z-20">
        <div className="mb-7 flex w-full flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow-white mb-1">Our Scholarship</p>
            <h2 className="font-bebas text-[clamp(3rem,7vw,5.625rem)] font-normal uppercase leading-[0.86] text-white">
              Featured Scholarships
            </h2>
          </div>

          <Link
            href="/scholarships"
            className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-2.5 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
          >
            View all active scholarships
          </Link>
        </div>

        <div className="row g-4 mx-auto max-w-[1320px]">
          {scholarships.map((scholarship, index) => {
            const runningTotal = scholarship.startingAmountCents + (donationTotals.get(scholarship.id) ?? 0);

            return (
              <div className="col-12 col-md-6 col-lg-4" key={scholarship.id}>
                <Link href={`/scholarships/${scholarship.slug}`} className="block h-full overflow-hidden rounded-md bg-white p-3 !text-[#202020] shadow-[0_5px_0_rgba(0,0,0,0.18)]">
                  <div className="relative h-[384px] w-full overflow-hidden rounded-md bg-[#eee6d6] lg:max-w-[410px]">
                    <Image
                      src={fallbackImages[index % fallbackImages.length]}
                      alt={scholarship.name}
                      fill
                      sizes="(min-width: 992px) 410px, (min-width: 768px) 48vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="pt-3">
                    <h3 className="font-bebas text-[34px] font-normal uppercase leading-[1.05] text-[#1E1E1E]">
                      {scholarship.name}
                    </h3>
                    <p className="mt-2 font-sans text-[16px] font-normal leading-normal text-[#B22222]">
                      {scholarship.field}
                    </p>
                    <p className="mt-2 font-sans text-[18px] font-normal leading-[26px] text-[#252628]">
                      {money(scholarship.awardAmountCents)} award / {scholarship.numberOfRecipients} recipient{scholarship.numberOfRecipients === 1 ? "" : "s"}
                    </p>
                    <dl className="mt-3 grid gap-2 font-sans text-sm leading-relaxed text-[#252628]">
                      <div>
                        <dt className="font-black uppercase text-[#8c0504]">Purpose</dt>
                        <dd className="line-clamp-2">{scholarship.description}</dd>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Starting fund amount</dt>
                          <dd>{money(scholarship.startingAmountCents)}</dd>
                        </div>
                        <div>
                          <dt className="font-black uppercase text-[#8c0504]">Running total</dt>
                          <dd>{money(runningTotal)}</dd>
                        </div>
                      </div>
                      <div>
                        <dt className="font-black uppercase text-[#8c0504]">Deadline</dt>
                        <dd>{formatDeadline(scholarship.applicationDeadline)}</dd>
                      </div>
                      <div>
                        <dt className="font-black uppercase text-[#8c0504]">Eligibility Criteria</dt>
                        <dd className="line-clamp-2">{scholarship.eligibility}</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
