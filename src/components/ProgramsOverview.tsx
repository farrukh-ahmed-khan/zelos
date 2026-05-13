const programs = [
  {
    title: "Financial Literacy",
    video: "/assets/financial-literacy.mp4",
    description:
      "Age-appropriate video lessons for children, teens, and young adults. Monthly content, drip-unlocked, with a downloadable Money Toolkit. Learn at home, at your own pace.",
    action: "Subscribe Now",
    href: "#",
  },
  {
    title: "School Curriculum",
    video: "/assets/school-curriculum.mp4",
    description:
      "Structured classroom programs for schools and districts. Educator portal, lesson plans, teacher guides, and student worksheets - ready to use from day one.",
    action: "Book a Demo",
    href: "#",
  },
  {
    title: "Mentoring",
    video: "/assets/mentoring.mp4",
    description:
      "Connect with real professionals across every field - finance, medicine, engineering, law, technology, and more. Free forum access. No subscription needed.",
    action: "Become a Mentor",
    href: "/become-a-mentor",
  },
  {
    title: "Scholarship Incubator",
    video: "/assets/scholarship-incubator.mp4",
    description:
      "Zelos manages scholarships end-to-end - from fund setup to recipient selection. Create one, donate to one, or apply for one.",
    action: "Explore Scholarships",
    href: "#",
  },
];

export function ProgramsOverview() {
  return (
    <section className="rounded-b-[2rem] bg-[#eee6d6] px-4 py-16 text-[#222] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-[520px] text-center">
          <p className="eyebrow-red mb-1">
            Our Programs
          </p>
          <h2 className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-center font-bebas text-[56px] font-bold uppercase leading-[50px] tracking-[-1px] text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] sm:text-[90px] sm:leading-[76px] sm:tracking-[-2px]">
            Zelos Programs
            <br />
            Overview
          </h2>
        </div>

        <div className="row g-4 mx-auto max-w-[960px]">
          {programs.map((program) => (
            <div className="col-12 col-lg-6" key={program.title}>
              <article className="flex h-full flex-col items-center rounded-2xl bg-white px-8 py-10 text-center shadow-[0_4px_0_rgba(0,0,0,0.08)]">
                <h3 className="font-bebas text-[2rem] uppercase leading-none text-[#202020] sm:text-[2.35rem]">
                  {program.title}
                </h3>

                <div className="my-6 flex h-[190px] w-full items-center justify-center sm:h-[220px]">
                  <video
                    className="h-full max-w-full object-contain"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-label={`${program.title} animation`}
                  >
                    <source src={program.video} type="video/mp4" />
                  </video>
                </div>

                <p className="mx-auto max-w-[360px] flex-1 text-sm leading-relaxed text-[#202020]">
                  {program.description}
                </p>

                <a
                  href={program.href}
                  className="mt-5 text-sm font-medium !text-[#b22222] transition hover:!text-[#7a0505]"
                >
                  {program.action} -&gt;
                </a>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
