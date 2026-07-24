import Image from "next/image";
import Link from "next/link";
import styles from "./MissionVideoIntro.module.css";

type MissionVideo = {
  title: string;
  description: string;
  url: string;
};

export function MissionVideoIntro({
  missionVideo,
}: {
  missionVideo?: MissionVideo | null;
}) {
  return (
    <section id="video-intro" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Mission Intro</h2>

        <Image
          src="/assets/mission-video-orb.gif"
          alt=""
          width={720}
          height={720}
          unoptimized
          sizes="(max-width: 767px) 190px, 20vw"
          className={styles.orb}
        />

        <div className={styles.player}>
          {missionVideo?.url ? (
            <div className={styles.videoFrame}>
              <div className={styles.addressBar}>
                <span>https://zelosMissions.com/</span>
                <span aria-hidden="true" className={styles.searchIcon} />
              </div>
              <video
                className={styles.video}
                controls
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
                preload="metadata"
                aria-label={missionVideo.title}
              >
                <source src={missionVideo.url} />
              </video>
            </div>
          ) : (
            <Image
              src="/assets/video-img.png"
              alt="Zelos mission video preview in a browser-style player"
              width={1693}
              height={1101}
              sizes="(max-width: 767px) 108vw, 88vw"
              className={styles.fallbackPlayer}
            />
          )}
        </div>

        <div
          className={`${styles.footer} ${
            missionVideo?.url ? styles.footerWithVideo : ""
          }`}
        >
          <p>
            Watch the story below — why Zelos was created, how our programs
            work, and the difference we&apos;re setting out to make in young
            people&apos;s lives.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className={styles.primaryAction}>
              Sign Up Free
            </Link>
            <Link
              href="/financial-literacy"
              className={styles.secondaryAction}
            >
              Explore Our Programs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
