import { connectToDatabase } from "@/lib/db";
import Donation from "@/models/Donation";
import Event from "@/models/Event";
import EventRsvp from "@/models/EventRsvp";
import FormSubmission from "@/models/FormSubmission";
import Order from "@/models/Order";
import Scholarship from "@/models/Scholarship";
import School from "@/models/School";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Video from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";

export async function getAdminAnalyticsOverview() {
  await connectToDatabase();

  const [
    subscribersByPlan,
    subscriptionsByStatus,
    videos,
    videoProgress,
    schools,
    orders,
    eventRsvps,
    events,
    scholarships,
    donations,
    fundScholarshipLeadStats,
    usersByRole,
    subscriptionsByCadenceAndStatus,
    recentEngagement,
  ] = await Promise.all([
    Subscription.aggregate([{ $group: { _id: "$planType", count: { $sum: 1 } } }]),
    Subscription.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Video.find().select("title ageTrack audience").lean(),
    VideoProgress.find({ completed: true }).select("videoId").lean(),
    School.find().select("name teacherLimit studentLimit teachersCount studentsCount licenseStatus").lean(),
    Order.find().select("totalCents status createdAt").lean(),
    EventRsvp.find().select("eventId").lean(),
    Event.find().select("title status").lean(),
    Scholarship.find().select("name status awardAmountCents numberOfRecipients applicationDeadline").lean(),
    Donation.find().sort({ createdAt: -1 }).limit(100).lean(),
    FormSubmission.aggregate([
      { $match: { type: "scholarship-inquiry" } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Subscription.aggregate([
      {
        $group: {
          _id: { planType: "$planType", status: "$status", billingStatus: "$billingStatus" },
          count: { $sum: 1 },
        },
      },
    ]),
    Promise.all([
      User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } }),
      VideoProgress.countDocuments({ completed: true }),
      EventRsvp.countDocuments(),
    ]),
  ]);

  const completionsByVideo = new Map<string, number>();
  for (const progress of videoProgress) {
    completionsByVideo.set(
      progress.videoId,
      (completionsByVideo.get(progress.videoId) ?? 0) + 1,
    );
  }

  const videoCompletionByLesson = videos.map((video) => ({
    id: video._id.toString(),
    title: video.title,
    ageTrack: video.ageTrack,
    audience: video.audience,
    completions: completionsByVideo.get(video._id.toString()) ?? 0,
  }));

  const videoCompletionByTrack = Object.values(
    videoCompletionByLesson.reduce<Record<string, { ageTrack: string; lessons: number; completions: number }>>(
      (acc, lesson) => {
        acc[lesson.ageTrack] ??= { ageTrack: lesson.ageTrack, lessons: 0, completions: 0 };
        acc[lesson.ageTrack].lessons += 1;
        acc[lesson.ageTrack].completions += lesson.completions;
        return acc;
      },
      {},
    ),
  );

  const rsvpsByEventId = new Map<string, number>();
  for (const rsvp of eventRsvps) {
    rsvpsByEventId.set(
      rsvp.eventId,
      (rsvpsByEventId.get(rsvp.eventId) ?? 0) + 1,
    );
  }

  return {
    subscribersByPlan,
    subscribersByTier: {
      free: usersByRole
        .filter((entry) => ["mentee"].includes(entry._id))
        .reduce((sum, entry) => sum + entry.count, 0),
      paidRoleAccounts: usersByRole
        .filter((entry) => entry._id === "subscriber")
        .reduce((sum, entry) => sum + entry.count, 0),
      byRole: usersByRole,
    },
    subscriptionsByCadenceAndStatus,
    subscriptionsByStatus,
    videoCompletionByTrack,
    videoCompletionByLesson,
    schoolLicenseUtilization: schools.map((school) => ({
      id: school._id.toString(),
      name: school.name,
      licenseStatus: school.licenseStatus,
      teachers: `${school.teachersCount}/${school.teacherLimit}`,
      students: `${school.studentsCount}/${school.studentLimit}`,
    })),
    swagStore: {
      orderVolume: orders.length,
      paidRevenueCents: orders
        .filter((order) => ["paid", "processing", "shipped", "delivered"].includes(order.status))
        .reduce((sum, order) => sum + order.totalCents, 0),
    },
    eventRsvpCounts: events.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      status: event.status,
      rsvps: rsvpsByEventId.get(event._id.toString()) ?? 0,
    })),
    scholarshipListings: scholarships.map((scholarship) => ({
      id: scholarship._id.toString(),
      name: scholarship.name,
      status: scholarship.status,
      awardAmountCents: scholarship.awardAmountCents,
      numberOfRecipients: scholarship.numberOfRecipients,
      applicationDeadline: scholarship.applicationDeadline,
    })),
    fundScholarshipLeadVolume: {
      total: fundScholarshipLeadStats.reduce((sum, entry) => sum + entry.count, 0),
      byStatus: fundScholarshipLeadStats,
    },
    engagement: {
      activeUsersLast30Days: recentEngagement[0],
      completedLessons: recentEngagement[1],
      totalEventRsvps: recentEngagement[2],
    },
    generalDonationHistory: donations.map((donation) => ({
      id: donation._id.toString(),
      firstName: donation.firstName,
      lastName: donation.lastName,
      email: donation.email,
      amountCents: donation.amountCents,
      purpose: donation.purpose ?? "general",
      scholarshipName: donation.scholarshipName ?? null,
      status: donation.status,
      createdAt: donation.createdAt,
    })),
  };
}
