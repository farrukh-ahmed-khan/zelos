import Image from "next/image";

type MissionVideo = {
  title: string;
  description: string;
  url: string;
};

export function WatchVideoSection({
  missionVideo,
}: {
  missionVideo?: MissionVideo | null;
}) {
  return (
    <section
      id="watch-video"
      className="overflow-hidden bg-white px-4 py-16 text-[#1f252b] sm:px-6 lg:py-20"
    >
      <div className="container">
        <div className="">
          <div className="mb-8 grid gap-7 md:grid-cols-[1fr_0.9fr] md:items-center">
            <div>
              <p className="eyebrow-red mb-1">
                Watch Video
              </p>
              <h2 className="home-section-heading bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                See what Zelos
                is all about
              </h2>
            </div>

            <p className="max-w-[460px] font-sans text-[18px] font-normal leading-[26px] text-black md:justify-self-end">
              David walks you through the mission, the programs, and why financial literacy changes lives.
              Straightforward, honest, and worth your three minutes.
            </p>
          </div>

          <div className="relative mx-auto">
            <div className="absolute inset-x-[8%] bottom-[5%] h-[20%] rounded-full bg-[#f0d7d2] blur-3xl" />
            {missionVideo?.url ? (
              <video
                className="relative z-10 aspect-video w-full rounded-[1rem] bg-black object-cover shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:rounded-[1.4rem]"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                playsInline
                preload="metadata"
                aria-label={missionVideo.title}
              >
                <source src={missionVideo.url} />
              </video>
            ) : (
              <Image
                src="/assets/video-img.png"
                alt="Zelos video preview in a browser-style player"
                width={1693}
                height={1101}
                className="relative z-10 h-auto w-full"
                sizes="(min-width: 1200px) 960px, calc(100vw - 2rem)"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
