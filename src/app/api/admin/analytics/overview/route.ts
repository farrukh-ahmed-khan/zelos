import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import Donation from "@/models/Donation";
import Event from "@/models/Event";
import EventRsvp from "@/models/EventRsvp";
import Order from "@/models/Order";
import Scholarship from "@/models/Scholarship";
import School from "@/models/School";
import Subscription from "@/models/Subscription";
import Video from "@/models/Video";
import VideoProgress from "@/models/VideoProgress";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "analytics.read");
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

    return successResponse({
      subscribersByPlan,
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
      generalDonationHistory: donations,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
