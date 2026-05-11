import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This operational draft must be reviewed by counsel before launch. It identifies the data categories and rights flows the platform is built to support."
      actions={[{ href: "/data-requests", label: "Data Request" }]}
      sections={[
        {
          title: "Data Collected",
          body: "Accounts, age range, role, school license membership, lesson progress, forum activity, RSVPs, donations, applications, store orders, and form submissions are stored only for platform operations.",
        },
        {
          title: "Children And Consent",
          body: "Age range is captured at signup for age-gated features. Under-13 parental consent policy, COPPA handling, and school consent language require attorney approval before production launch.",
        },
        {
          title: "Regional Rights",
          body: "GDPR, CCPA, access, correction, deletion, and portability requests are routed through the data request endpoint for admin review.",
        },
      ]}
    />
  );
}
