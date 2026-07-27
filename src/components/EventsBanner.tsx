import Image from "next/image";
import { Header } from "@/components/Header";
import styles from "./EventsBanner.module.css";

export function EventsBanner() {
  return (
    <section className={`${styles.banner} page-banner-frame`}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <Header />

      <div className={`banner-content-width page-banner-inner ${styles.content}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Events</p>
          <h1 className={styles.title}>
            <span className={styles.outline}>Real opportunities.</span>
            <span className={styles.solid}>Real connections.</span>
            <span className={styles.solid}>Real impact.</span>
          </h1>
          <p className={styles.intro}>
            Zelos Events connect children, teens, and young adults with mentors
            from diverse fields who share real-world insights, practical
            financial and life skills, and meaningful guidance.
          </p>
          <p className={styles.intro}>
            Each event is designed to spark ambition, build confidence, and
            open doors to lasting relationships and future opportunities.
          </p>
        </div>
      </div>

      <Image
        src="/assets/events-lookout.png"
        alt=""
        width={676}
        height={860}
        priority
        className={styles.character}
      />
    </section>
  );
}
