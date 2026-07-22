import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function AboutPage() {
  return (
    <StaticInfoPage
      eyebrow="About Zelos"
      title="Opportunity Shouldn’t Be An Accident Of Birth"
      intro="Too many young people have the drive to succeed and none of the access and no one to explain how money works, no mentor who's walked the path, no scholarship with their name on it. Zelos was built to close that gap."
      cmsSlug="about"
      heroVariant="about"
      sections={[
        {
          title: "The Mission",
          body: "The platform helps children, teens, young adults, families, and educators build practical money skills with age-aware learning paths and public community support.",
          points: ["Age-tracked learning", "School access", "Scholarships and community support"],
        },
        {
          title: "How It Works",
          body: "Public visitors can read, apply, donate, shop, and explore events. Account holders unlock dashboards, forums, RSVP tools, and role-specific resources.",
        },
      ]}
    />
  );
}
