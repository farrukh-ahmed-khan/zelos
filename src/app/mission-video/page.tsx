import { StaticInfoPage } from "@/components/StaticInfoPage";
import { WatchVideoSection } from "@/components/WatchVideoSection";

export default function MissionVideoPage() {
  return (
    <>
      <StaticInfoPage
        eyebrow="Mission Video"
        title="See what Zelos is all about"
        intro="The homepage mission video is managed from the admin content library and can be swapped without developer support."
        actions={[{ href: "/signup", label: "Create Account" }, { href: "/become-a-mentor", label: "Apply To Mentor" }]}
        sections={[
          {
            title: "Admin Swappable",
            body: "Mission video records use the same content management API as the subscriber and school libraries, with a dedicated mission flag.",
          },
        ]}
      />
      <WatchVideoSection />
    </>
  );
}
