import Image from "next/image";
import styles from "./ScholarshipIntro.module.css";

export function ScholarshipIntro() {
  return (
    <section id="scholarship-intro" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 className={styles.title}>Intro</h2>
          <p className={styles.body}>
            A scholarship starts with your idea and the meaning behind it. You
            decide the name, the purpose, who it&apos;s for, and the award. Tell
            us through the Fund a Scholarship form, and we&apos;ll take it from
            there talking through the details with you directly and getting
            your scholarship in front of the students who need it.
          </p>
        </div>

        <Image
          src="/assets/scholarship-pathway.png"
          alt="Students walking through a red doorway toward a professional career"
          width={1008}
          height={922}
          sizes="(max-width: 767px) 110vw, 55vw"
          className={styles.figure}
        />
      </div>
    </section>
  );
}
