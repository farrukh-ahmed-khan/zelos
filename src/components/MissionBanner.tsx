import Image from "next/image";
import { Header } from "@/components/Header";
import styles from "./MissionBanner.module.css";

export function MissionBanner() {
  return (
    <section
      className={`${styles.banner} relative mx-auto min-h-[calc(100vh-2rem)] overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-16 2xl:px-24`}
    >
      <Image
        src="/assets/about-banner-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.background}
      />

      <Header />

      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Our Mission</p>
          <h1 className={styles.title}>
            <span className={styles.outline}>Empowering</span>
            <span className={styles.solid}>Tomorrow&apos;s</span>
            <span className={styles.solid}>Leaders</span>
          </h1>
          <p className={styles.intro}>
            Zelos exists to give the next generation the opportunity and access
            to become confident, capable leaders in every field of human
            endeavor.
          </p>
        </div>
      </div>

      <Image
        src="/assets/mission-character.gif"
        alt="Animated business leader lifting a barbell"
        width={720}
        height={1280}
        unoptimized
        priority
        className={styles.character}
      />
    </section>
  );
}
