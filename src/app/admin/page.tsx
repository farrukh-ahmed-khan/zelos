import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminChrome, AdminMetric, AdminPanel, AdminRow } from "@/components/admin/AdminChrome";
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
import SubscriberResource from "@/models/SubscriberResource";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import User from "@/models/User";
import Video from "@/models/Video";

export const dynamic = "force-dynamic";

const modules = [
  { title: "Super Admin Dashboard", href: "/super-admin", permission: "analytics.read", detail: "Full-platform command center for David" },
  { title: "Content Management", href: "/admin/videos", permission: "content.manage", detail: "Subscriber, school, preview, mission videos" },
  { title: "Content Categories", href: "/admin/content-categories", permission: "content.manage", detail: "Age track category setup" },
  { title: "Subscription Plans", href: "/admin/subscription-plans", permission: "billing.read", detail: "Monthly, annual, and promo plans" },
  { title: "Users & Roles", href: "/admin/users", permission: "users.manage-limited", detail: "Statuses, deletion, RBAC scopes" },
  { title: "Admin Invites", href: "/admin/invites", permission: "users.manage-limited", detail: "Moderator and sub-admin invite links" },
  { title: "Schools", href: "/admin/schools", permission: "schools.manage", detail: "School and district onboarding, seats, teacher invites" },
  { title: "Subscriber Content", href: "/admin/subscriber-content", permission: "content.manage", detail: "Premium subscriber worksheets, guides, templates, and downloads" },
  { title: "School Content", href: "/admin/school-content", permission: "content.manage", detail: "Teacher videos, student lessons, lesson plans, worksheets" },
  { title: "Money Toolkit", href: "/admin/toolkit", permission: "content.manage", detail: "Subscriber worksheets, quizzes, templates, prompts" },
  { title: "Forum Moderation", href: "/admin/forum-moderation", permission: "forum.moderate", detail: "Reports, post removal, thread removal, user actions" },
  { title: "Events", href: "/admin/events", permission: "events.manage", detail: "Create, edit, cancel, RSVP lists, online links" },
  { title: "Scholarships", href: "/admin/scholarships", permission: "users.manage-limited", detail: "Listings, applicant review queue, archive workflow" },
  { title: "Mentor Applications", href: "/api/admin/mentor-applications", permission: "users.manage-limited", detail: "Review/contact inbox" },
  { title: "Forum Moderation", href: "/api/admin/forum/reports", permission: "forum.moderate", detail: "Reports, remove, suspend, resolve" },
  { title: "Analytics", href: "/api/admin/analytics/overview", permission: "analytics.read", detail: "Subscribers, video completion, revenue, RSVP, funds" },
  { title: "Email Outbox", href: "/api/admin/emails", permission: "users.manage-limited", detail: "Transactional email queue visibility" },
  { title: "Donation History", href: "/admin/donations", permission: "billing.read", detail: "One-time donation records and receipts" },
  { title: "Public Forms", href: "/admin/forms", permission: "users.manage-limited", detail: "Fund a scholarship leads and public inquiries" },
] as const;

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
    subscriberResources,
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
    SubscriberResource.countDocuments(),
    MentorApplication.countDocuments(),
    ForumReport.countDocuments({ status: "open" }),
    Order.countDocuments(),
    Donation.countDocuments(),
    EmailOutbox.countDocuments({ status: "pending" }),
    FormSubmission.countDocuments({ status: "new" }),
  ]);

  const visibleModules = modules.filter((module) => {
    if (module.href === "/super-admin") {
      return user.role === "super-admin";
    }

    return hasAdminPermission(user.role, user.adminPermissions, module.permission);
  });

  return (
    <AdminChrome title="Platform Control Center" isSuperAdmin={user.role === "super-admin"}>
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <AdminMetric label="Users" value={users} />
        <AdminMetric label="Videos" value={videos} />
        <AdminMetric label="Plans" value={plans} />
        <AdminMetric label="Subscriptions" value={subscriptions} />
        <AdminMetric label="Events" value={events} />
        <AdminMetric label="Scholarships" value={scholarships} />
        <AdminMetric label="Subscriber Files" value={subscriberResources} />
        <AdminMetric label="Mentors" value={mentors} />
        <AdminMetric label="Open Reports" value={reports} />
        <AdminMetric label="Orders" value={orders} />
        <AdminMetric label="Donations" value={donations} />
        <AdminMetric label="Email Queue" value={emails} />
        <AdminMetric label="Form Inbox" value={forms} />
      </section>

      <section className="mt-6">
        <AdminPanel title="Available Modules">
          <div className="overflow-hidden rounded-md border border-[#edf0f3]">
            {visibleModules.map((module) => (
              <AdminRow
                key={module.href}
                href={module.href}
                title={module.title}
                meta={module.detail}
              />
            ))}
          </div>
        </AdminPanel>
      </section>
    </AdminChrome>
  );
}
