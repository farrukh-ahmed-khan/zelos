import Image from "next/image";

const scholarships = [
  {
    title: "The Future Leaders Scholarship",
    category: "Engineering & Technology",
    image: "/assets/future-leader.png",
    description:
      "Supporting first-generation college students pursuing careers in engineering, computer science, or technology.",
  },
  {
    title: "The Young Economist Award",
    category: "Finance & Economics",
    image: "/assets/young-economist.png",
    description:
      "For high school juniors and seniors demonstrating outstanding financial literacy and academic achievement.",
  },
  {
    title: "The Community Builder Grant",
    category: "Social Work & Public Policy",
    image: "/assets/community-builder.png",
    description:
      "Honoring students committed to public service and community development in underserved areas.",
  },
];

export function ActiveScholarships() {
  return (
    <section className="relative overflow-hidden bg-[#8c0504] px-4 py-20 text-white sm:px-6 lg:py-24">
      <div className="absolute inset-x-0 top-0 z-10 h-12 rounded-b-[2rem] bg-[#eee6d6]" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-16 rounded-t-[2rem] bg-[#eee6d6]" />
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.28)_0_1px,transparent_2px),linear-gradient(135deg,transparent_0_48%,rgba(255,255,255,0.18)_49%_51%,transparent_52%)] [background-size:88px_88px,140px_140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(202,27,18,0.8),rgba(63,0,0,0.92)_78%)]" />

      <div className="container relative z-20">
        <div className="mx-auto mb-7 flex max-w-[960px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 font-bebas text-xs uppercase leading-none text-[#f2ebda]">
              Our Scholarship
            </p>
            <h2 className="font-bebas text-[clamp(2.5rem,4vw,3.6rem)] uppercase leading-[0.85] text-white">
              Active Scholarships
            </h2>
          </div>

          <a
            href="#"
            className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-2.5 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
          >
            View all active scholarships
          </a>
        </div>

        <div className="row g-4 mx-auto max-w-[960px]">
          {scholarships.map((scholarship) => (
            <div className="col-12 col-md-6 col-lg-4" key={scholarship.title}>
              <article className="h-full overflow-hidden rounded-md bg-white p-3 text-[#202020] shadow-[0_5px_0_rgba(0,0,0,0.18)]">
                <div className="relative h-[180px] overflow-hidden rounded-md bg-[#eee6d6] sm:h-[205px] lg:h-[175px]">
                  <Image
                    src={scholarship.image}
                    alt={scholarship.title}
                    fill
                    sizes="(min-width: 992px) 290px, (min-width: 768px) 48vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="pt-3">
                  <h3 className="font-bebas text-[1.35rem] uppercase leading-none text-[#202020]">
                    {scholarship.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold text-[#b22222]">
                    {scholarship.category}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#333]">
                    {scholarship.description}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
