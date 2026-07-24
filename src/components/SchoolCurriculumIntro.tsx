import Image from "next/image";
import styles from "./SchoolCurriculumIntro.module.css";

export function SchoolCurriculumIntro() {
  return (
    <section id="school-curriculum-intro" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.title}>Intro</h2>
          <p className={styles.body}>
            The Zelos School Curriculum gives educators a complete,
            classroom-ready system for teaching financial literacy — with
            tracks designed for children, teens, and young adults, each matched
            to where students actually are.
          </p>
        </div>

        <Image
          src="/assets/school-curriculum-intro.png"
          alt="A student learning online with books, papers, and school supplies"
          width={747}
          height={793}
          sizes="(max-width: 560px) 130vw, 39vw"
          className={styles.figure}
        />
      </div>
    </section>
  );
}
