import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function ScholarshipIncubatorPage() {
  return (
    <StaticInfoPage
      eyebrow="Scholarship Incubator"
      title="Scholarships That Create Lasting Impact"
      intro="The Zelos Scholarship Incubator helps anyone turn a meaningful idea honoring a loved one, championing a cause, backing a certain kind of student into a real scholarship students can apply for."
      heroVariant="scholarship"
      actions={[
        { href: "/scholarships", label: "Browse Scholarships" },
        { href: "/fund-a-scholarship", label: "Fund a Scholarship" },
      ]}
      form={{
        endpoint: "/api/forms/scholarship-inquiry",
        submitLabel: "Send Inquiry",
        fields: [
          { name: "name", label: "Full name" },
          { name: "email", label: "Email", type: "email" },
          { name: "contact", label: "Best contact method" },
          { name: "scholarshipConcept", label: "Scholarship concept", textarea: true },
          { name: "intendedAudience", label: "Intended audience" },
          { name: "budgetRange", label: "Budget range" },
          { name: "notes", label: "Notes", textarea: true },
          { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
        ],
      }}
      sections={[
        {
          title: "Managed Lifecycle",
          body: "Admin tools cover manual listing creation, public applications, application review, off-platform forwarding to the scholarship owner, closing, and archive status.",
        },
        {
          title: "Public Apply",
          body: "Scholarship applications are public and do not require an account. Zelos does not collect scholarship funds, process escrow, or run an in-platform selection workflow.",
        },
      ]}
    />
  );
}
