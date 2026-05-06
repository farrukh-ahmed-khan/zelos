export function MiddleBanner() {
  return (
    <section className="bg-white p-5">
      <div className="relative min-h-[520px] w-full overflow-hidden rounded-[1.25rem] bg-[#8c0504] px-6 py-8 sm:min-h-[610px] sm:px-12 lg:px-[82px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/middle-banner-bg.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-cover bg-bottom"
          style={{ backgroundImage: "url('/assets/middle-banner-bg-gradient.png')" }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-[444px] flex-col justify-end gap-8 sm:min-h-[534px] lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-bebas text-[clamp(3rem,5vw,4.2rem)] uppercase leading-[0.82] text-white">
            <span className="block sm:whitespace-nowrap">Start Your Journey</span>
            <span className="block">With Us</span>
          </h2>

          <div className="flex flex-wrap gap-3 pb-1 lg:pb-6">
            <a
              href="#"
              className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Sign Up Free
            </a>
            <a
              href="#"
              className="rounded-md border-2 border-[#212121] bg-[#f4f1e9] px-7 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-white"
            >
              Subscribe Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
