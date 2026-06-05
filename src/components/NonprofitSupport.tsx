import Image from "next/image";

export function NonprofitSupport() {
  return (
    <section className="bg-[#eee6d6] px-4 py-16 text-[#111] sm:px-6 lg:py-20">
      <div className="container">
        <div className="row mx-auto max-w-[1120px] items-center gy-8">
          <div className="col-12 col-lg-4">
            <p className="eyebrow-red mb-2">
              Support Zelos
            </p>
            <h2 className="font-bebas text-[clamp(3.1rem,5.2vw,5rem)] uppercase leading-[0.95] tracking-normal text-black">
              Zelos Is A
              <br />
              Recognized
              <br />
              Nonprofit
              <br />
              Organization
            </h2>
          </div>

          <div className="col-12 col-lg-4">
            <div className="mx-auto flex max-w-[330px] justify-center">
              <Image
                src="/assets/donation-bag.png"
                alt="Donation bag with money and heart"
                width={330}
                height={409}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="max-w-[390px]">
              <p className="text-[1.15rem] leading-snug text-black">
                Every dollar — from subscriptions, school licenses, merchandise, and
                donations — flows directly back into content creation, mentoring
                programs, scholarships, and community events. No investors. No
                shareholders. Just young people and the people who believe in them.
              </p>

              <a
                href="#"
                className="mt-8 inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
              >
                Donate To Zelos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
