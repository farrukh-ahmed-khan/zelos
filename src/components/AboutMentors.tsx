import Image from "next/image";
import styles from "./AboutMentors.module.css";

export function AboutMentors() {
  return (
    <section className="relative z-20 -mt-8 rounded-t-[2rem] bg-[#eee6d6] px-4 py-12 text-[#202020] sm:px-6 lg:py-14">
      <div className="container grid max-w-[1280px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div className={styles.diagram} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.innerOrbit} />

          <div className={styles.logo}>
            <span className={styles.logoName}>Zelos</span>
            <svg
              viewBox="0 0 120 100"
              className={styles.logoShield}
              aria-hidden="true"
            >
              <path d="M14 8h92v35c0 24-18 39-46 50C32 82 14 67 14 43V8Z" />
              <path d="M33 29h54L39 69h49" />
            </svg>
            <span className={styles.logoTagline}>Financial Literacy &amp; Mentoring</span>
          </div>

          <span className={`${styles.node} ${styles.topNode}`}>
            <Image
              src="/assets/mentor-helmet.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.nodeImage}
            />
          </span>
          <span className={`${styles.node} ${styles.leftNode}`}>
            <Image
              src="/assets/mentor-presentation.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.nodeImage}
            />
          </span>
          <span className={`${styles.node} ${styles.rightNode}`}>
            <Image
              src="/assets/mentor-art.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.nodeImage}
            />
          </span>
          <span className={`${styles.node} ${styles.bottomLeftNode}`}>
            <Image
              src="/assets/mentor-group.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.nodeImage}
            />
          </span>
          <span className={`${styles.node} ${styles.bottomRightNode}`}>
            <Image
              src="/assets/mentor-live.gif"
              alt=""
              width={640}
              height={640}
              unoptimized
              className={styles.nodeImage}
            />
          </span>
        </div>

        <div className="max-w-[590px]">
          <h2 className="font-bebas text-[clamp(2.8rem,4vw,4rem)] font-normal uppercase leading-[0.88] text-[#202020]">
            <span className="whitespace-nowrap">
              Mentors From{" "}
              <span className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_95%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                Every
              </span>
            </span>
            <br />
            Field
          </h2>
          <p className="mt-4 max-w-[540px] text-[15px] leading-[1.6] text-[#343434] lg:text-base">
            We connect young people with mentors from every field of human endeavor.
            Through in-person events, online sessions, podcasts, and the Zelos forum,
            mentees hear the real story behind a career: the challenges, the
            decisions, and the lessons that never make it onto a résumé.
          </p>
        </div>
      </div>
    </section>
  );
}
