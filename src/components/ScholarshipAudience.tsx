import Image from "next/image";
import Link from "next/link";
import styles from "./ScholarshipAudience.module.css";

export function ScholarshipAudience() {
  return (
    <section className={styles.section} aria-label="Scholarship opportunities">
      <article className={styles.panel}>
        <Image
          src="/assets/scholarship-for-students.png"
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
          className={styles.background}
        />
        <div className={styles.copy}>
          <h2>For Students</h2>
          <p className={styles.description}>
            Explore scholarships that fit your goals and apply right from the
            listing — clear criteria, a simple form, and no account required.
          </p>
          <Link href="/scholarships" className={styles.link}>
            View Scholarship Opportunities
          </Link>
        </div>
      </article>

      <article className={styles.panel}>
        <Image
          src="/assets/scholarship-for-funders.png"
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
          className={styles.background}
        />
        <div className={styles.copy}>
          <h2>For Funders</h2>
          <p className={styles.description}>
            Ready to start? Tell us about the scholarship you have in mind.
          </p>
          <Link href="/fund-a-scholarship" className={styles.link}>
            View Scholarship Opportunities
          </Link>
          <div className={styles.why}>
            <p className={styles.whyLabel}>Why It Matters</p>
            <p>
              The Scholarship Incubator is a simple, meaningful way to open a
              door for a student and a clear path to creating something that
              lasts.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
