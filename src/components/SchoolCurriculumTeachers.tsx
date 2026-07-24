import Image from "next/image";
import styles from "./SchoolCurriculumTeachers.module.css";

export function SchoolCurriculumTeachers() {
  return (
    <section
      id="what-teachers-get"
      className={styles.section}
      aria-labelledby="what-teachers-get-title"
    >
      <div className={styles.surface}>
        <div className={styles.inner}>
          <div className={styles.copy}>
            <h2 id="what-teachers-get-title" className={styles.title}>
              What Teachers Get
            </h2>
            <p className={styles.body}>
              An educator portal puts everything in one place: organized
              lesson plans, teacher guides, and student worksheets. Every
              module pairs peer-led video lessons with real-world activities
              and practical scenarios, so students don&apos;t just hear about
              financial decisions. They see how those decisions play out.
            </p>
          </div>
        </div>

        <div className={styles.artwork} aria-hidden="true">
          <Image
            src="/assets/school-curriculum-teachers.png"
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 55vw"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
