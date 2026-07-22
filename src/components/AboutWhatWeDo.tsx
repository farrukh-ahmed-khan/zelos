const programs = [
  {
    title: "Age-Based Financial Literacy",
    video: "/assets/financial-literacy.mp4",
    description:
      "Peer-led video lessons for children, teens, and young adults.",
  },
  {
    title: "School Curriculum",
    video: "/assets/school-curriculum.mp4",
    description:
      "Classroom-ready financial literacy for schools and districts.",
  },
  {
    title: "Mentoring",
    video: "/assets/mentoring.mp4",
    description:
      "Guidance from professionals across every field through events, podcasts, and the forum.",
  },
  {
    title: "Scholarship Incubator",
    video: "/assets/scholarship-incubator.mp4",
    description:
      "A way to create scholarships in honor of someone or something meaningful, and for students to apply.",
  },
];

export function AboutWhatWeDo() {
  return (
    <section
      id="what-we-do"
      className="relative z-10 rounded-b-[2rem] bg-[#eee6d6] px-4 py-14 text-[#202020] sm:px-6 lg:py-20"
    >
      <div className="container">
        <div className="mx-auto mb-10 text-center sm:mb-12">
          <h2 className="home-section-heading mx-auto w-fit bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            What We Do
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#343434] sm:text-base">
            Zelos brings together four programs that work as one.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 sm:gap-5">
          {programs.map((program) => (
            <article
              key={program.title}
              className="flex min-h-[410px] flex-col items-center rounded-2xl bg-white px-5 py-8 text-center shadow-[0_3px_0_rgba(0,0,0,0.06)] sm:min-h-[470px] sm:px-8 sm:py-10"
            >
              <h3 className="font-bebas text-[clamp(2rem,3.2vw,3.25rem)] font-normal uppercase leading-none text-[#202020]">
                {program.title}
              </h3>

              <div className="my-6 flex h-[230px] w-full items-center justify-center sm:h-[280px] lg:h-[310px]">
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

              <p className="mx-auto mt-auto max-w-md text-sm font-medium leading-relaxed text-[#343434] sm:text-base">
                {program.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
