import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function MentoringPage() {
  return (
    <StaticInfoPage
      eyebrow="Mentoring"
      title="Mentorship Changes Everything"
      intro="Zelos connects young people with mentors from every field — people who’ve walked the path and show up to share what they learned along the way."
      actions={[{ href: "/become-a-mentor", label: "Apply To Mentor" }]}
      heroVariant="mentoring"
      sections={[
        {
          title: "Application Only",
          body: "The form collects expertise, experience, bio, communication preferences, event availability, and referral source.",
        },
        {
          title: "Admin Review",
          body: "Admins can view, open, mark reviewed, and mark contacted from the mentor application inbox.",
        },
      ]}
    />
  );
}
