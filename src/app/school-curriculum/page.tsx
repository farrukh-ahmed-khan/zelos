import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function SchoolCurriculumPage() {
  return (
    <StaticInfoPage
      eyebrow="School Curriculum"
      title="Financial Literacy Your Class Will Actually Remember."
      intro="A ready-to-teach program built for schools and districts — age-appropriate, peer-led, and fully supported from day one."
      heroVariant="school"
      actions={[{ href: "/schools", label: "Schools Page" }]}
      // form={{
      //   endpoint: "/api/forms/school-demo",
      //   submitLabel: "Request Demo",
      //   fields: [
      //     { name: "name", label: "Full name" },
      //     { name: "email", label: "Email", type: "email" },
      //     { name: "category", label: "School or district" },
      //     { name: "message", label: "What should we know?", textarea: true },
      //     { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
      //   ],
      // }}

    />
  );
}
