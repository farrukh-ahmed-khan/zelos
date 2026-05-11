import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function SchoolCurriculumPage() {
  return (
    <StaticInfoPage
      eyebrow="School Curriculum"
      title="School licenses, teacher tools, student lessons"
      intro="Schools are created by admin invite only, with teacher and student invite flows, seat limits, assigned tracks, and a separate school content library."
      actions={[{ href: "/schools", label: "Schools Page" }]}
      form={{
        endpoint: "/api/forms/school-demo",
        submitLabel: "Request Demo",
        fields: [
          { name: "name", label: "Full name" },
          { name: "email", label: "Email", type: "email" },
          { name: "category", label: "School or district" },
          { name: "message", label: "What should we know?", textarea: true },
          { name: "companyWebsite", label: "Company website", type: "hidden", value: "" },
        ],
      }}
      sections={[
        {
          title: "Educator Portal",
          body: "Teachers receive a role-specific dashboard with training videos, lesson plan downloads, class progress, student invites, and upcoming content schedules.",
        },
        {
          title: "Student Access",
          body: "Students join by teacher invite, get assigned lessons, and receive worksheet access through the school content system.",
        },
      ]}
    />
  );
}
