import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function MentoringPage() {
  return (
    <StaticInfoPage
      eyebrow="Mentoring"
      title="Apply to support the mission"
      intro="Mentor applicants do not receive a platform account or public profile. Applications go to the admin inbox for off-platform follow-up."
      actions={[{ href: "/become-a-mentor", label: "Apply To Mentor" }]}
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
