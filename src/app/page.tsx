import { ActiveScholarships } from "@/components/ActiveScholarships";
import { CommunityForumPreview } from "@/components/CommunityForumPreview";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { MiddleBanner } from "@/components/MiddleBanner";
import { NonprofitSupport } from "@/components/NonprofitSupport";
import { ProgramsOverview } from "@/components/ProgramsOverview";
import { SwagStoreHighlight } from "@/components/SwagStoreHighlight";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { WatchVideoSection } from "@/components/WatchVideoSection";
import { getProducts, serializeProduct } from "@/lib/store/service";
import { getHomepageMissionVideo } from "@/lib/videos/service";

export default async function Home() {
  const [storeProducts, missionVideo] = await Promise.all([
    getProducts()
      .then((docs) => docs.map(serializeProduct).slice(0, 4))
      .catch(() => []),
    getHomepageMissionVideo().catch(() => null),
  ]);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-white">
      <div className="padding-sections p-4 sm:p-6">
        <HeroBanner />
      </div>
      <WatchVideoSection missionVideo={missionVideo} />
      <div className="padding-sections p-4 sm:p-6">
        <ProgramsOverview />
      </div>
      <ActiveScholarships />
      <UpcomingEvents />
      <CommunityForumPreview />
      <MiddleBanner />
      <SwagStoreHighlight products={storeProducts} />
      <NonprofitSupport />
      <Footer />
    </main>
  );
}
