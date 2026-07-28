import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function ContactPage() {
  return (
    <StaticInfoPage
      eyebrow="Contact"
      title="Talk to Zelos"
      intro="Use this form for support, school questions, scholarships, donations, events, or general platform questions."
      form={{
        endpoint: "/api/forms/contact",
        submitLabel: "Send Message",
        fields: [
          { name: "name", label: "Full name" },
          { name: "email", label: "Email", type: "email" },
          { name: "category", label: "Category" },
          { name: "message", label: "Message", textarea: true },
          { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
        ],
      }}
      showGetInTouch
    />
  );
}
