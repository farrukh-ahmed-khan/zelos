import Image from "next/image";
import styles from "./ScholarshipHowItWorks.module.css";

const steps = [
  {
    number: "01",
    title: "Share Your Idea",
    body: "Fill out the Fund a Scholarship form — the concept, who you want to support, and the amount you have in mind. No account needed.",
    image: "/assets/scholarship-step-idea.png",
    imageAlt: "A white pathway rising toward a flag",
    icon: "/assets/scholarship-step-idea.gif",
  },
  {
    number: "02",
    title: "We Talk It Through",
    body: "A member of the Zelos team reaches out to work through the details with you.",
    image: "/assets/scholarship-step-talk.png",
    imageAlt: "A team discussing ideas around a table",
    icon: "/assets/scholarship-step-talk.gif",
  },
  {
    number: "03",
    title: "Your Scholarship Goes Live",
    body: "We publish the listing on Zelos with its purpose, eligibility, award, and how to apply.",
    image: "/assets/scholarship-step-live.png",
    imageAlt: "A red chess piece standing above a growing platform",
    icon: "/assets/scholarship-step-live.gif",
  },
  {
    number: "04",
    title: "Students Apply",
    body: "Applications come in through the listing, and we make sure they reach you for the decision that’s yours to make.",
    image: "/assets/scholarship-step-apply.png",
    imageAlt: "Applicants seated for a scholarship conversation",
    icon: "/assets/scholarship-step-apply.gif",
  },
] as const;

export function ScholarshipHowItWorks() {
  return (
    <section id="scholarship-how-it-works" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>How It Works</h2>

        <div className={styles.grid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.card}>
              <div className={styles.visual}>
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  sizes="(max-width: 767px) 45vw, 37vw"
                  className={styles.stepImage}
                />
              </div>

              <div className={styles.details}>
                <Image
                  src={step.icon}
                  alt=""
                  width={640}
                  height={640}
                  unoptimized
                  className={styles.icon}
                />
                <div className={styles.stepCopy}>
                  <h3>
                    {step.number}. {step.title}
                  </h3>
                  <p>{step.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
