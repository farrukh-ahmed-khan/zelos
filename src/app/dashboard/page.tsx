import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { hasAdminPermission } from "@/lib/auth/roles";
import { connectToDatabase } from "@/lib/db";
import { getEventsWithRsvpStatus } from "@/lib/events/service";
import { getForumReports, getForumThreads } from "@/lib/forum/service";
import { getMentorApplications } from "@/lib/mentor-applications/service";
import { getChildSubscriberAccounts } from "@/lib/subscribers/service";
import { resolveSubscriptionAccessForUser } from "@/lib/subscriptions/service";
import { serializeResolvedSubscription } from "@/lib/subscriptions/serialize-subscription";
import { serializeUser } from "@/lib/users/serialize-user";
import { buildVideoAvailability } from "@/lib/videos/service";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function resolveSubscriptionLabel(subscription: unknown) {
  if (
    typeof subscription === "object" &&
    subscription !== null &&
    "hasPremiumAccess" in subscription
  ) {
    return subscription.hasPremiumAccess ? "Premium" : "Free";
  }

  return "Free";
}

export default async function DashboardPage() {
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

  if (!user || user.isBanned || user.status === "banned") {
    redirect("/login");
  }

  const userId = user._id.toString();
  const canReadUsers = hasAdminPermission(
    user.role,
    user.adminPermissions,
    "users.manage-limited",
  );
  const canModerateForum = hasAdminPermission(
    user.role,
    user.adminPermissions,
    "forum.moderate",
  );

  const [
    videosResult,
    eventsResult,
    threadsResult,
    childrenResult,
    subscriptionResult,
    usersCountResult,
    reportsResult,
    mentorApplicationsResult,
  ] = await Promise.allSettled([
    buildVideoAvailability(user),
    getEventsWithRsvpStatus(userId),
    getForumThreads(),
    user.role === "subscriber"
      ? getChildSubscriberAccounts(user)
      : Promise.resolve([]),
    user.role === "child"
      ? Promise.resolve(null)
      : resolveSubscriptionAccessForUser(user),
    canReadUsers ? User.countDocuments() : Promise.resolve(0),
    canModerateForum ? getForumReports() : Promise.resolve([]),
    canReadUsers ? getMentorApplications() : Promise.resolve([]),
  ]);

  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const threads = threadsResult.status === "fulfilled" ? threadsResult.value : [];
  const childrenAccounts =
    childrenResult.status === "fulfilled"
      ? childrenResult.value.map((child) => serializeUser(child))
      : [];
  const subscription =
    subscriptionResult.status === "fulfilled" && subscriptionResult.value
      ? serializeResolvedSubscription(subscriptionResult.value)
      : null;
  const usersCount =
    usersCountResult.status === "fulfilled" ? usersCountResult.value : 0;
  const reports = reportsResult.status === "fulfilled" ? reportsResult.value : [];
  const mentorApplications =
    mentorApplicationsResult.status === "fulfilled"
      ? mentorApplicationsResult.value
      : [];

  return (
    <DashboardShell
      user={serializeUser(user)}
      videos={videos}
      events={events}
      threads={threads}
      childrenAccounts={childrenAccounts}
      subscriptionLabel={resolveSubscriptionLabel(subscription)}
      adminSummary={{
        usersCount,
        forumReportsCount: reports.length,
        mentorApplicationsCount: mentorApplications.length,
      }}
    />
  );
}
