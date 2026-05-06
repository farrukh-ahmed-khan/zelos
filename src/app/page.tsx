import { ActiveScholarships } from "@/components/ActiveScholarships";
import { CommunityForumPreview } from "@/components/CommunityForumPreview";
import { HeroBanner } from "@/components/HeroBanner";
import { ProgramsOverview } from "@/components/ProgramsOverview";
import { UpcomingEvents } from "@/components/UpcomingEvents";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eee6d6] text-white">
      <div className="padding-sections p-4 sm:p-6">
        <HeroBanner />
        <ProgramsOverview />
      </div>
      <ActiveScholarships />
      <UpcomingEvents />
      <CommunityForumPreview />
    </main>
  );
}
