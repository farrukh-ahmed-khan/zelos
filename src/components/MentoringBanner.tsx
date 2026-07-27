import { Header } from "@/components/Header";
import styles from "./MentoringBanner.module.css";

export function MentoringBanner({
  eyebrow,
  intro,
}: {
  eyebrow: string;
  intro: string;
}) {
  return (
    <section
      className={`${styles.banner} page-banner-frame relative mx-auto overflow-hidden rounded-[1.25rem] px-3 py-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.38)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-16 2xl:px-24`}
    >
      <div aria-hidden="true" className={styles.background} />

      <video
        className={styles.character}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/assets/mentoring-character-poster.jpg"
        aria-label="A young professional discovering the mentor and leader within"
      >
        <source src="/assets/mentoring-character.mp4" type="video/mp4" />
      </video>

      <div className={styles.visualFade} />
      <Header />

      <div className={`banner-content-width page-banner-inner ${styles.content}`}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} banner-eyebrow`}>{eyebrow}</p>
          <h1 className={styles.title}>
            <span className={styles.outline}>Mentorship</span>
            <span className={styles.solid}>Changes Everything</span>
          </h1>
          <p className={styles.intro}>{intro}</p>
        </div>
      </div>
    </section>
  );
}
