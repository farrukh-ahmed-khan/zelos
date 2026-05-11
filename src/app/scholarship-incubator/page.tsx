import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function ScholarshipIncubatorPage() {
  return (
    <StaticInfoPage
      eyebrow="Scholarship Incubator"
      title="Zelos-managed scholarship funds"
      intro="Scholarships are created by Zelos admins. The public can browse active listings, donate to a scholarship, or apply without creating an account."
      actions={[{ href: "/scholarships", label: "Browse Scholarships" }]}
      form={{
        endpoint: "/api/forms/scholarship-inquiry",
        submitLabel: "Send Inquiry",
        fields: [
          { name: "name", label: "Full name" },
          { name: "email", label: "Email", type: "email" },
          { name: "category", label: "Organization or fund idea" },
          { name: "message", label: "Scholarship inquiry", textarea: true },
          { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
        ],
      }}
      sections={[
        {
          title: "Managed Lifecycle",
          body: "Admin tools cover listing creation, escrow confirmation, applications, shortlist preparation, award distribution, a 5% management fee, and archive status.",
        },
        {
          title: "Public Donation And Apply",
          body: "Scholarship donations are separate from general Zelos donations, with fund totals and progress available on the listing pages.",
        },
      ]}
    />
  );
}
