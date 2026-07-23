import { Footer } from "@/components/Footer";
import { MissionBanner } from "@/components/MissionBanner";
import { MissionStatement } from "@/components/MissionStatement";
import { MissionVideoIntro } from "@/components/MissionVideoIntro";
import { getHomepageMissionVideo } from "@/lib/videos/service";

export default async function MissionVideoPage() {
  const missionVideo = await getHomepageMissionVideo().catch(() => null);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      <div className="p-4 sm:p-6">
        <MissionBanner />
      </div>
      <MissionStatement />
      <MissionVideoIntro missionVideo={missionVideo} />
      <Footer />
    </main>
  );
}
