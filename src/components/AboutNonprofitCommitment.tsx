import Image from "next/image";

export function AboutNonprofitCommitment() {
  return (
    <section className="relative z-20 flex min-h-[400px] items-center overflow-hidden bg-white px-4 py-12 text-[#202020] sm:min-h-[420px] sm:px-6 lg:min-h-[540px] lg:py-14">
      <Image
        src="/assets/nonprofit-commitment-bg.png"
        alt=""
        width={1441}
        height={758}
        sizes="(min-width: 1024px) 76vw, (min-width: 640px) 86vw, 100vw"
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain sm:h-auto sm:w-[86%] lg:w-[76%]"
      />

      <div className="container relative z-10">
        <div className="mx-auto max-w-[520px] text-center">
          <h2 className="mx-auto w-fit bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_32%)] bg-clip-text font-bebas text-[clamp(3.25rem,5.4vw,5.5rem)] font-normal uppercase leading-[0.88] text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Our Nonprofit
            <br />
            Commitment
          </h2>
          <p className="mx-auto mt-6 max-w-[470px] text-sm leading-[1.65] text-[#343434] sm:text-base">
            Zelos is a nonprofit. The funds we raise go straight into producing
            financial literacy content and expanding opportunity for young people.
            Our swag store and donation center help sustain the work. Every
            contribution keeps the programs growing.
          </p>
        </div>
      </div>
    </section>
  );
}
