import Image from "next/image";

export function AboutHowWeTeach() {
  return (
    <section
      id="how-we-teach"
      className="relative -mt-8 overflow-hidden rounded-b-[2rem] bg-[radial-gradient(circle_at_58%_38%,#aa0b0b_0%,#7d0505_36%,#310000_100%)] px-4 pb-16 pt-24 text-white sm:px-6 lg:pb-20 lg:pt-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(0,0,0,0.4),transparent_48%,rgba(0,0,0,0.32))]" />

      <div className="container relative z-10 grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="max-w-md">
          <h2 className="font-bebas text-[clamp(3rem,5vw,5.25rem)] font-normal uppercase leading-none text-white">
            How We Teach
          </h2>
          <p className="mt-5 text-base leading-[1.65] text-white/95 sm:text-lg">
            Young people learn best from voices that sound like their own. Our
            lessons are performed by peers with real stories and real scenarios so
            financial concepts don&apos;t just get explained, they get understood.
            And the content grows with the learner, meeting children, teens, and
            young adults exactly where they are.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border-[10px] border-black bg-black shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:border-[12px]">
          <Image
            src="/assets/how-we-teach.gif"
            alt="Animated lesson showing young people working through financial choices"
            width={1280}
            height={720}
            unoptimized
            className="h-auto w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
