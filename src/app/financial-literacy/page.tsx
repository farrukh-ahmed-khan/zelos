import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function FinancialLiteracyPage() {
  return (
    <StaticInfoPage
      eyebrow="Financial Literacy"
      title="Money lessons by age track"
      intro="Children, teens, and young adults get separate learning paths with sequential video unlocks, worksheets, quizzes, and downloadable money tools."
      actions={[{ href: "/signup", label: "Start Free" }, { href: "/dashboard", label: "Open Dashboard" }]}
      sections={[
        {
          title: "Learning Tracks",
          body: "The content library supports Children, Teens, and Young Adults, each with categories, sequence ordering, release dates, and completion tracking.",
          points: ["Children", "Teens", "Young Adults"],
        },
        {
          title: "Money Toolkit",
          body: "Worksheets, budgeting templates, goal-setting worksheets, quizzes, and guided discussion prompts unlock according to completion and subscription status.",
        },
      ]}
    />
  );
}
