import Link from "next/link";
import styles from "./MentoringIntro.module.css";

export function MentoringIntro() {
  return (
    <section id="mentoring-intro" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Intro</h2>

        <div className={styles.copy}>
          <p>
            Most young people never get to ask a working professional the
            questions that matter. What&apos;s the job really like? How did you
            decide? What would you do differently? The Zelos Mentoring Program
            opens that door.
          </p>

          <p>
            Mentees connect with mentors through special events, live and
            recorded podcasts, video messages, and an interactive forum built
            for questions, reflection, and guidance. It&apos;s a place to learn
            from many voices, explore different paths, and get real clarity
            about what&apos;s possible.
          </p>

          <p>
            Whatever the field finance, medicine, engineering,
            entrepreneurship, the arts, or anything else a young person can
            dream toward Zelos mentors bring lived experience, not just theory.
            The goal is simple: build confidence, broaden perspective, and help
            young people see what&apos;s possible when they learn directly from
            someone who&apos;s done it.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/events" className={styles.primaryAction}>
            See Upcoming Events
          </Link>
          <Link href="/become-a-mentor" className={styles.secondaryAction}>
            Become a Mentor
          </Link>
        </div>
      </div>
    </section>
  );
}
