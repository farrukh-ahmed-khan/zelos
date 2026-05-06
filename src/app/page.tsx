import { ActiveScholarships } from "@/components/ActiveScholarships";
import { HeroBanner } from "@/components/HeroBanner";
import { ProgramsOverview } from "@/components/ProgramsOverview";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eee6d6] text-white">
      <div className="padding-sections p-4 sm:p-6">
        <HeroBanner />
        <ProgramsOverview />
      </div>
      <ActiveScholarships />
    </main>
  );
}
