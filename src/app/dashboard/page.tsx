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
import { getSchoolResourcesForUser, serializeSchoolResource } from "@/lib/school-resources/service";
import { getSubscriberResourcesForUser, serializeSubscriberResource } from "@/lib/subscriber-resources/service";
import { resolveSubscriptionAccessForUser } from "@/lib/subscriptions/service";
import { serializeResolvedSubscription } from "@/lib/subscriptions/serialize-subscription";
import { serializeUser } from "@/lib/users/serialize-user";
import {
  buildFreePreviewAvailability,
  buildVideoAvailability,
  requiresSubscriptionForVideos,
} from "@/lib/videos/service";
import User from "@/models/User";
import Order from "@/models/Order";

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

  if (!user || user.isBanned || user.status === "banned" || !user.emailVerifiedAt) {
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
    eventsResult,
    threadsResult,
    subscriptionResult,
    schoolResourcesResult,
    subscriberResourcesResult,
    usersCountResult,
    reportsResult,
    mentorApplicationsResult,
    ordersResult,
  ] = await Promise.allSettled([
    getEventsWithRsvpStatus(userId),
    getForumThreads(),
    resolveSubscriptionAccessForUser(user),
    ["teacher", "student"].includes(user.role) ? getSchoolResourcesForUser(user) : Promise.resolve([]),
    ["subscriber", "child"].includes(user.role) ? getSubscriberResourcesForUser(user) : Promise.resolve([]),
    canReadUsers ? User.countDocuments() : Promise.resolve(0),
    canModerateForum ? getForumReports() : Promise.resolve([]),
    canReadUsers ? getMentorApplications() : Promise.resolve([]),
    Order.find({
      $or: [{ userId }, { email: user.email }],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const threads = threadsResult.status === "fulfilled" ? threadsResult.value : [];
  const subscription =
    subscriptionResult.status === "fulfilled" && subscriptionResult.value
      ? serializeResolvedSubscription(subscriptionResult.value)
      : null;
  const needsVideoSubscription = requiresSubscriptionForVideos(user);
  const hasVideoLibraryAccess =
    !needsVideoSubscription || Boolean(subscription?.hasPremiumAccess);
  const videos = hasVideoLibraryAccess ? await buildVideoAvailability(user) : [];
  const freePreviewVideos = hasVideoLibraryAccess
    ? []
    : await buildFreePreviewAvailability(user);
  const schoolResources =
    schoolResourcesResult.status === "fulfilled"
      ? schoolResourcesResult.value.map(serializeSchoolResource)
      : [];
  const subscriberResources =
    subscriberResourcesResult.status === "fulfilled"
      ? subscriberResourcesResult.value.map(serializeSubscriberResource)
      : [];
  const usersCount =
    usersCountResult.status === "fulfilled" ? usersCountResult.value : 0;
  const reports = reportsResult.status === "fulfilled" ? reportsResult.value : [];
  const mentorApplications =
    mentorApplicationsResult.status === "fulfilled"
      ? mentorApplicationsResult.value
      : [];
  const orders =
    ordersResult.status === "fulfilled"
      ? ordersResult.value.map((order) => ({
          id: order._id.toString(),
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
          })),
          totalCents: order.totalCents,
          status: order.status,
          createdAt: order.createdAt,
        }))
      : [];

  return (
    <DashboardShell
      user={serializeUser(user)}
      videos={videos}
      freePreviewVideos={freePreviewVideos}
      events={events}
      threads={threads}
      schoolResources={JSON.parse(JSON.stringify(schoolResources))}
      subscriberResources={JSON.parse(JSON.stringify(subscriberResources))}
      orders={JSON.parse(JSON.stringify(orders))}
      subscriptionLabel={resolveSubscriptionLabel(subscription)}
      hasVideoLibraryAccess={hasVideoLibraryAccess}
      needsVideoSubscription={needsVideoSubscription}
      adminSummary={{
        usersCount,
        forumReportsCount: reports.length,
        mentorApplicationsCount: mentorApplications.length,
      }}
    />
  );
}
