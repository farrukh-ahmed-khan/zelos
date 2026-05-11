import Image from "next/image";

export function WatchVideoSection() {
  return (
    <section
      id="watch-video"
      className="overflow-hidden bg-white px-4 py-16 text-[#1f252b] sm:px-6 lg:py-20"
    >
      <div className="container">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-8 grid gap-7 md:grid-cols-[1fr_0.9fr] md:items-center">
            <div>
              <p className="mb-1 font-bebas text-xs uppercase leading-none text-[#b22222]">
                Watch Video
              </p>
              <h2 className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text font-bebas text-[56px] font-bold uppercase leading-[50px] tracking-[-1px] text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] sm:text-[70px] sm:leading-[62px] sm:tracking-[-2px]">
                Swag Store Highlight
              </h2>
            </div>

            <p className="max-w-[460px] text-sm leading-relaxed text-[#111] md:justify-self-end">
              David walks you through the mission, the programs, and why
              financial literacy changes lives. Straightforward, honest, and
              worth your three minutes.
            </p>
          </div>

          <div className="relative mx-auto">
            <div className="absolute inset-x-[8%] bottom-[5%] h-[20%] rounded-full bg-[#f0d7d2] blur-3xl" />
            <Image
              src="/assets/video-img.png"
              alt="Zelos video preview in a browser-style player"
              width={1693}
              height={1101}
              className="relative z-10 h-auto w-full"
              sizes="(min-width: 1200px) 960px, calc(100vw - 2rem)"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
