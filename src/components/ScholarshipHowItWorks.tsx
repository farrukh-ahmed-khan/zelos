import Image from "next/image";
import styles from "./ScholarshipHowItWorks.module.css";

const steps = [
  {
    number: "01",
    title: "Share Your Idea",
    body: "Tell us about the scholarship you want to create: the concept behind it, the students you want to support, and the amount you will start it with. One short form, no account needed.",
    image: "/assets/scholarship-step-idea.png",
    imageAlt: "A white pathway rising toward a flag",
    icon: "/assets/scholarship-step-idea.gif",
  },
  {
    number: "02",
    title: "We Reach Out",
    body: "A member of the Zelos team contacts you directly to work through the details and set the eligibility criteria, so the scholarship reflects exactly what you intended.",
    image: "/assets/scholarship-step-talk.png",
    imageAlt: "A team discussing ideas around a table",
    icon: "/assets/scholarship-step-talk.gif",
  },
  {
    number: "03",
    title: "Approved, Funded, and Goes Live",
    body: "Once the details are agreed and the funding is confirmed, your scholarship is published on Zelos with its purpose, criteria, and award, and becomes visible to students.",
    image: "/assets/scholarship-step-live.png",
    imageAlt: "A red chess piece standing above a growing platform",
    icon: "/assets/scholarship-step-live.gif",
  },
  {
    number: "04",
    title: "Zelos Manages and Students Apply",
    body: "From there, Zelos takes care of the running of your scholarship. Students apply through the listing, and their applications come straight to you for the decision that is yours to make.",
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
