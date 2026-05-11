import { StaticInfoPage } from "@/components/StaticInfoPage";

export default function TermsPage() {
  return (
    <StaticInfoPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="This operational draft must be reviewed by counsel before launch. Payments, subscriptions, refunds, forum rules, and scholarship terms need final legal language."
      sections={[
        {
          title: "Accounts And Access",
          body: "Users must accept terms at signup. Role-based access, invite-only school accounts, public forum read-only access, and admin moderation rules are enforced in the app.",
        },
        {
          title: "Payments And Refunds",
          body: "Subscriptions, donations, store purchases, gift cards, and scholarship donations are separated by flow. Stripe production terms and refund policy must be finalized before launch.",
        },
        {
          title: "Community Rules",
          body: "All forum communication is public. There are no direct messages. Report, moderation, suspension, and ban workflows are available to authorized moderators and admins.",
        },
      ]}
    />
  );
}
