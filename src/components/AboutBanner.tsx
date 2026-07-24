import Image from "next/image";
import { Header } from "@/components/Header";
import styles from "./AboutBanner.module.css";

export function AboutBanner({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  const titleParts = title.match(/^(Opportunity)\s+(.+)$/i);
  const outlinedTitle = titleParts?.[1] ?? title;
  const solidTitle = titleParts?.[2] ?? "";
  const solidLines = solidTitle.match(/^(Shouldn[’']t Be An)\s+(.+)$/i);
  const highlightedPhrases = /((?:money works)|(?:no mentor who's walked the path)|(?:no scholarship)|(?:Zelos))/gi;
  const isHighlightedPhrase = /^(?:(?:money works)|(?:no mentor who's walked the path)|(?:no scholarship)|(?:Zelos))$/i;

  return (
    <section
      className={`${styles.banner} relative mx-auto min-h-[calc(100vh-2rem)] overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.45)] sm:min-h-[calc(100vh-3rem)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-16 2xl:px-24`}
    >
      <Image
        src="/assets/about-banner-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.background}
      />

      <Header />

      <div className={`container ${styles.content}`}>
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
          <p className={styles.intro}>
            {intro.split(highlightedPhrases).map((part, index) =>
              isHighlightedPhrase.test(part) ? (
                <strong key={`${part}-${index}`}>{part}</strong>
              ) : (
                part
              ),
            )}
          </p>
        </div>
      </div>

      <Image
        src="/assets/about-character.gif"
        alt="Animated figure in a suit"
        width={720}
        height={1280}
        unoptimized
        priority
        className={styles.character}
      />
    </section>
  );
}
