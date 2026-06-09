import Image from "next/image";
import { Header } from "@/components/Header";

export function HeroBanner() {
  return (
    <section className="relative mx-auto min-h-[calc(100vh-2rem)] overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-16 2xl:px-24">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-multiply"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/assets/bg-video.mp4" type="video/quicktime" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />

      <Header />

      <div className="container relative z-10 pt-8 lg:pt-2">
        <div className="row min-h-[calc(100vh-8rem)] items-center lg:min-h-[calc(100vh-7rem)]">
          <div className="col-12 col-lg-7">
            <div className="py-10 lg:py-0">
              <p className="eyebrow-white mb-3">
                Welcome to Zelos
              </p>
              <h1 className="font-bebas text-[clamp(4rem,9vw,6.4rem)] font-bold uppercase leading-[0.86] text-white 2xl:text-[clamp(4rem,18vw,7.5rem)]">
                Empowering the
                <br />
                Next <span className="text-transparent [-webkit-text-stroke:2px_#EEDEC5]">Generation</span>
              </h1>
              <p className="mt-3 inline-block bg-[#F2EBDA] px-2 py-1 font-bebas text-[20px] font-bold uppercase leading-tight text-[#B22222] sm:text-[24px] 2xl:text-[28px]">
                With financial literacy, mentorship, scholarship, and opportunity.
              </p>
              <p className="mt-3 max-w-[680px] font-sans text-[18px] font-normal leading-[1.45] text-white sm:text-[20px] lg:max-w-[620px] 2xl:text-[24px]">
                Giving young people the tools, guidance, and real-world exposure they
                need to build strong futures - wherever they&apos;re starting from.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 2xl:mt-9">
                <a
                  href="/financial-literacy"
                  className="rounded-md bg-[#FAFF8D] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] border-2
                   border-[#212121] transition hover:bg-[#fff176] focus:outline-none focus:ring-2 focus:ring-[#fff176]/50 active:bg-[#fff176]
                   active:shadow-[0_2px_0_#111]"
                >
                  Watch a Free Video
                </a>
                <a
                  href="/signup"
                  className="rounded-md bg-[#f4f1e9] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] border-2
                   border-[#212121] transition hover:bg-[#fff176] focus:outline-none focus:ring-2 focus:ring-[#fff176]/50 active:bg-[#fff176]
                   active:shadow-[0_2px_0_#111]"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="pointer-events-none relative min-h-75 overflow-hidden sm:min-h-135 lg:min-h-152.5 lg:overflow-visible">
              <Image
                src="/assets/hero-gif.gif"
                alt="Animated superhero standing on a cliff"
                width={760}
                height={711}
                unoptimized
                className="absolute bottom-0 -right-5 w-[min(520px,95vw)] max-w-none object-contain sm:-right-10 sm:w-[min(520px,88vw)] lg:-bottom-12 lg:-right-42.5 lg:w-[min(660px,116vw)] xl:-right-52.5 2xl:-right-70 2xl:w-[min(820px,118vw)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
