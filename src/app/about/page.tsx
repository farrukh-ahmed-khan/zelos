import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function AboutPage() {
  return (
    <StaticInfoPage
      eyebrow="About Zelos"
      title="Financial confidence for real life"
      intro="Zelos brings financial literacy, mentoring pathways, school programming, scholarships, events, and community into one mission-led platform."
      actions={[{ href: "/signup", label: "Join Free" }, { href: "/donate", label: "Support Zelos" }]}
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
