import Image from "next/image";
import Link from "next/link";
import styles from "./SchoolCurriculumReady.module.css";

export function SchoolCurriculumReady() {
  return (
    <section
      id="ready-from-day-one"
      className={styles.section}
      aria-labelledby="ready-from-day-one-title"
    >
      <Image
        src="/assets/school-curriculum-ready.png"
        alt=""
        fill
        sizes="100vw"
        className={styles.background}
        aria-hidden="true"
      />
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="ready-from-day-one-title" className={styles.title}>
            Ready From Day One
          </h2>
          <p className={styles.body}>
            An educator portal puts everything in one place: organized lesson
            plans, teacher guides, and student worksheets. Every module pairs
            peer-led video lessons with real-world activities and practical
            scenarios, so students don&apos;t just hear about financial
            decisions. They see how those decisions play out.
          </p>

          <div className={styles.actions}>
            <Link href="/contact" className={styles.primaryAction}>
              Request a Demo
            </Link>
            <Link href="/schools" className={styles.secondaryAction}>
              Bring Zelos to Your School
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
