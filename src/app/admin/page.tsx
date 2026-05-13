import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import Donation from "@/models/Donation";
import EmailOutbox from "@/models/EmailOutbox";
import Event from "@/models/Event";
import FormSubmission from "@/models/FormSubmission";
import ForumReport from "@/models/ForumReport";
import MentorApplication from "@/models/MentorApplication";
import Order from "@/models/Order";
import Scholarship from "@/models/Scholarship";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import User from "@/models/User";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

const modules = [
  { title: "Content Management", href: "/api/admin/videos", permission: "content.manage", detail: "Subscriber, school, preview, mission videos" },
  { title: "Content Categories", href: "/api/admin/content-categories", permission: "content.manage", detail: "Age track category setup" },
  { title: "Subscription Plans", href: "/api/admin/subscription-plans", permission: "billing.read", detail: "Monthly, annual, individual, family, promo plans" },
  { title: "Events", href: "/api/admin/events", permission: "events.manage", detail: "Create, edit, cancel, RSVP lists, online links" },
  { title: "Scholarships", href: "/api/admin/scholarships", permission: "content.manage", detail: "Listings, escrow, applicants, awards" },
  { title: "Mentor Applications", href: "/api/admin/mentor-applications", permission: "users.manage-limited", detail: "Review/contact inbox" },
  { title: "Forum Moderation", href: "/api/admin/forum/reports", permission: "forum.moderate", detail: "Reports, remove, suspend, resolve" },
  { title: "Analytics", href: "/api/admin/analytics/overview", permission: "analytics.read", detail: "Subscribers, video completion, revenue, RSVP, funds" },
  { title: "Email Outbox", href: "/api/admin/emails", permission: "users.manage-limited", detail: "Transactional email queue visibility" },
  { title: "Public Forms", href: "/api/admin/forms", permission: "users.manage-limited", detail: "Contact, demo, data, scholarship inquiries" },
] as const;

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      <p className="text-xs font-black uppercase tracking-wide text-[#b22222]">
        {label}
      </p>
      <p className="mt-2 font-bebas text-4xl uppercase leading-none">{value}</p>
    </article>
  );
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  let payload;
  try {
    payload = await verifyAuthToken(token);
  } catch {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(payload.sub);

  if (!user || !["sub-admin", "super-admin"].includes(user.role)) {
    redirect("/dashboard");
  }

  const [
    users,
    videos,
    plans,
    subscriptions,
    events,
    scholarships,
    mentors,
    reports,
    orders,
    donations,
    emails,
    forms,
  ] = await Promise.all([
    User.countDocuments(),
    Video.countDocuments(),
    SubscriptionPlan.countDocuments(),
    Subscription.countDocuments(),
    Event.countDocuments(),
    Scholarship.countDocuments(),
    MentorApplication.countDocuments(),
    ForumReport.countDocuments({ status: "open" }),
    Order.countDocuments(),
    Donation.countDocuments(),
    EmailOutbox.countDocuments({ status: "pending" }),
    FormSubmission.countDocuments({ status: "new" }),
  ]);

  const visibleModules = modules.filter((module) =>
    hasAdminPermission(user.role, user.adminPermissions, module.permission),
  );

  return (
    <main className="min-h-screen bg-[#eee6d6] p-4 text-[#202020] sm:p-6">
      <section className="rounded-[2rem] bg-[#8c0504] px-5 py-5 text-white shadow-[inset_0_0_100px_rgba(0,0,0,0.38)] sm:px-9 lg:px-14">
        <div className="container flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="rounded-sm bg-white px-4 py-3 text-2xl font-bold !text-[#343434] shadow-[0_3px_0_rgba(0,0,0,0.18)]">
            Zelos
          </Link>
          <Link href="/dashboard" className="rounded-md bg-white px-4 py-2 text-sm font-black !text-[#212121]">
            Dashboard
          </Link>
        </div>

        <div className="container py-10">
          <p className="eyebrow-white">
            Admin Panel
          </p>
          <h1 className="font-bebas text-[clamp(3rem,7vw,5.8rem)] uppercase leading-[0.86]">
            Platform control center
          </h1>
          <p className="mt-3 max-w-[760px] text-lg leading-snug text-white/90">
            Content, billing configuration, events, scholarships, moderation,
            analytics, transactional emails, and public form inboxes share one protected view.
          </p>
        </div>
      </section>

      <section className="container grid gap-4 py-8 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Users" value={users} />
        <MetricCard label="Videos" value={videos} />
        <MetricCard label="Plans" value={plans} />
        <MetricCard label="Subscriptions" value={subscriptions} />
        <MetricCard label="Events" value={events} />
        <MetricCard label="Scholarships" value={scholarships} />
        <MetricCard label="Mentors" value={mentors} />
        <MetricCard label="Open Reports" value={reports} />
        <MetricCard label="Orders" value={orders} />
        <MetricCard label="Donations" value={donations} />
        <MetricCard label="Email Queue" value={emails} />
        <MetricCard label="Form Inbox" value={forms} />
      </section>

      <section className="container grid gap-4 pb-10 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-md border-2 border-[#212121] bg-white p-5 !text-[#202020] shadow-[0_4px_0_#111] transition hover:-translate-y-0.5"
          >
            <p className="font-bebas text-3xl uppercase leading-none">
              {module.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#555]">
              {module.detail}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
