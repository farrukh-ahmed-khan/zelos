import AdminInvite from "@/models/AdminInvite";
import ContentCategory from "@/models/ContentCategory";
import EmailOutbox from "@/models/EmailOutbox";
import Event from "@/models/Event";
import FormSubmission from "@/models/FormSubmission";
import ForumReport from "@/models/ForumReport";
import Order from "@/models/Order";
import Product from "@/models/Product";
import School from "@/models/School";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import User from "@/models/User";
import Video from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";

export async function getSuperAdminOverview() {
  const [
    users,
    activeUsers,
    subscribers,
    schools,
    videos,
    plans,
    activeSubscriptions,
    canceledSubscriptions,
    pendingEmails,
    newForms,
    openReports,
    orders,
    revenueOrders,
    invites,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active", isBanned: false }),
    User.countDocuments({ role: "subscriber" }),
    School.countDocuments(),
    Video.countDocuments(),
    SubscriptionPlan.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Subscription.countDocuments({ status: "canceled" }),
    EmailOutbox.countDocuments({ status: "pending" }),
    FormSubmission.countDocuments({ status: "new" }),
    ForumReport.countDocuments({ status: "open" }),
    Order.countDocuments(),
    Order.find({ status: { $in: ["paid", "processing", "shipped", "delivered"] } })
      .select("totalCents")
      .lean(),
    AdminInvite.countDocuments({ usedAt: null, expiresAt: { $gt: new Date() } }),
  ]);

  const paidRevenueCents = revenueOrders.reduce(
    (sum, order) => sum + order.totalCents,
    0,
  );

  return {
    users,
    activeUsers,
    subscribers,
    schools,
    videos,
    plans,
    activeSubscriptions,
    canceledSubscriptions,
    pendingEmails,
    newForms,
    openReports,
    orders,
    paidRevenueCents,
    invites,
  };
}

export async function getSuperAdminAccessDashboard() {
  const [roles, statuses, recentUsers, openInvites] = await Promise.all([
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role status ageTrack createdAt")
      .lean(),
    AdminInvite.find({ usedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("email role expiresAt")
      .lean(),
  ]);

  return { roles, statuses, recentUsers, openInvites };
}

export async function getSuperAdminBillingDashboard() {
  const [plans, subscriptionStatuses, subscriptions, products, orders] =
    await Promise.all([
      SubscriptionPlan.find().sort({ interval: 1, accountType: 1 }).lean(),
      Subscription.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Subscription.find().sort({ createdAt: -1 }).limit(12).lean(),
      Product.find().sort({ isActive: -1, name: 1 }).limit(12).lean(),
      Order.find().sort({ createdAt: -1 }).limit(12).lean(),
    ]);

  return { plans, subscriptionStatuses, subscriptions, products, orders };
}

export async function getSuperAdminContentDashboard() {
  const [videosByAudience, videosByTrack, categories, latestVideos] =
    await Promise.all([
      Video.aggregate([{ $group: { _id: "$audience", count: { $sum: 1 } } }]),
      Video.aggregate([{ $group: { _id: "$ageTrack", count: { $sum: 1 } } }]),
      ContentCategory.find().sort({ audience: 1, ageTrack: 1, order: 1 }).lean(),
      Video.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

  return { videosByAudience, videosByTrack, categories, latestVideos };
}

export async function getSuperAdminAnalyticsDashboard() {
  const [videoProgress, videos, schools, forms, emails, events] = await Promise.all([
    VideoProgress.find({ completed: true }).select("videoId").lean(),
    Video.find().select("title ageTrack audience").lean(),
    School.find().sort({ licenseStatus: 1, name: 1 }).lean(),
    FormSubmission.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
    EmailOutbox.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Event.find().sort({ date: -1 }).limit(10).lean(),
  ]);

  const completions = new Map<string, number>();
  for (const progress of videoProgress) {
    completions.set(progress.videoId, (completions.get(progress.videoId) ?? 0) + 1);
  }

  const lessonCompletion = videos.map((video) => ({
    id: video._id.toString(),
    title: video.title,
    ageTrack: video.ageTrack,
    audience: video.audience,
    completions: completions.get(video._id.toString()) ?? 0,
  }));

  return { lessonCompletion, schools, forms, emails, events };
}
