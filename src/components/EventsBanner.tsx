import Image from "next/image";
import { Header } from "@/components/Header";
import styles from "./EventsBanner.module.css";

export function EventsBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <Header />

      <div className={`banner-content-width ${styles.content}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Events</p>
          <h1 className={styles.title}>
            <span className={styles.outline}>Designed to impress.</span>
            <span className={styles.solid}>Your guests will</span>
            <span className={styles.solid}>never forget.</span>
          </h1>
          <p className={styles.intro}>
            A ready-to-teach program built for schools and districts
            age-appropriate, peer-led, and fully supported from day one.
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
