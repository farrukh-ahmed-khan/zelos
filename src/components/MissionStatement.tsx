import Image from "next/image";
import styles from "./MissionStatement.module.css";

export function MissionStatement() {
  return (
    <section id="mission-in-full" className={styles.section}>
      <div className={`container ${styles.content}`}>
        <div className={styles.copy}>
          <h2 className={styles.title}>The Mission, In Full</h2>
          <p className={styles.body}>
            We bring together financial literacy, mentorship, and scholarships
            to create one clear pathway for children, teens, and young adults:
            to understand money, explore careers, and reach for opportunities
            that once felt out of reach.
          </p>
        </div>
      </div>

      <Image
        src="/assets/mission-full.png"
        alt="A heroic figure standing confidently with a flowing cape"
        width={783}
        height={862}
        sizes="(max-width: 767px) 135vw, 42vw"
        className={styles.figure}
      />
    </section>
  );
}
