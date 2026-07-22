import Image from "next/image";

export function AboutOurVision() {
  return (
    <section className="bg-white px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8">
      <div className="relative min-h-[460px] overflow-hidden rounded-[1.25rem] bg-[#9d0a0a] sm:min-h-[520px] sm:rounded-[2rem] lg:min-h-[min(46vw,640px)]">
        <Image
          src="/assets/our-vision-bg.jpg"
          alt="Two hands tracing the rise and fall of an opportunity graph"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#b50909]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_38%,rgba(91,0,0,0.12)_58%,rgba(91,0,0,0.88)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 z-10 grid gap-5 px-6 pb-8 text-white sm:px-10 sm:pb-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-12 lg:px-16 lg:pb-14 2xl:px-24">
          <h2 className="font-bebas text-[clamp(3.5rem,6vw,6.25rem)] font-normal uppercase leading-none">
            Our Vision
          </h2>
          <p className="max-w-[600px] text-sm leading-[1.6] text-white sm:text-base lg:justify-self-end lg:text-lg">
            Zelos is building a national platform that gives young people the
            knowledge, mentorship, and access to step into their future with
            confidence. Financial literacy, mentoring, scholarships, community,
            and one clear pathway to discover what&apos;s possible.
          </p>
        </div>
      </div>
    </section>
  );
}
