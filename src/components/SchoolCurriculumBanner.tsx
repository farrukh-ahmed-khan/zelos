import Image from "next/image";
import { Header } from "@/components/Header";
import styles from "./SchoolCurriculumBanner.module.css";

export function SchoolCurriculumBanner({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  const titleParts = title.match(/^(Financial Literacy)\s+(.+)$/i);
  const outlinedTitle = titleParts?.[1] ?? title;
  const solidTitle = titleParts?.[2] ?? "";
  const solidLines = solidTitle.match(/^(Your Class Will)\s+(.+)$/i);

  return (
    <section
      className={`${styles.banner} page-banner-frame relative mx-auto overflow-hidden rounded-[1.25rem] px-3 py-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.42)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-16 2xl:px-24`}
    >
      <div aria-hidden="true" className={styles.background} />
      <div aria-hidden="true" className={styles.visualFade} />

      <Header />

      <div className={`banner-content-width page-banner-inner ${styles.content}`}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} banner-eyebrow`}>{eyebrow}</p>
          <h1 className={styles.title}>
            <span className={styles.outline}>{outlinedTitle}</span>
            {solidLines ? (
              <>
                <span className={styles.solid}>{solidLines[1]}</span>
                <span className={styles.solid}>{solidLines[2]}</span>
              </>
            ) : (
              <span className={styles.solid}>{solidTitle}</span>
            )}
          </h1>
          <p className={styles.intro}>{intro}</p>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <Image
            src="/assets/school-curriculum-hero-illustration.gif"
            alt=""
            width={1280}
            height={720}
            loading="eager"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
