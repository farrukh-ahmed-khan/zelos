import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function DataRequestsPage() {
  return (
    <StaticInfoPage
      eyebrow="Privacy"
      title="Data access and deletion requests"
      intro="Submit an access, correction, or deletion request. Admins can review submissions from the protected forms inbox."
      form={{
        endpoint: "/api/forms/data-request",
        submitLabel: "Submit Request",
        fields: [
          { name: "name", label: "Full name" },
          { name: "email", label: "Account email", type: "email" },
          { name: "requestType", label: "Request type: access, correction, deletion, or portability" },
          { name: "message", label: "Request details", textarea: true },
          { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
        ],
      }}
      sections={[
        {
          title: "Compliance Workflow",
          body: "Requests are validated server-side, stored as form submissions, and confirmed through the transactional email outbox.",
        },
      ]}
    />
  );
}
