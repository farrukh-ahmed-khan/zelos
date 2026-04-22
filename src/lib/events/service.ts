import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import Event from "@/models/Event";
import EventRsvp from "@/models/EventRsvp";
import User from "@/models/User";
import { notifyUsers, queueEmail, queueEmailsForUserIds } from "@/lib/notifications/service";

export async function getEventsWithRsvpStatus(userId?: string) {
  await connectToDatabase();

  const [events, rsvps] = await Promise.all([
    Event.find().sort({ date: 1, createdAt: -1 }).lean(),
    userId ? EventRsvp.find({ userId }).lean() : Promise.resolve([]),
  ]);

  const rsvpEventIds = new Set(rsvps.map((rsvp) => rsvp.eventId));

  return events.map((event) => ({
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    coverImageUrl: event.coverImageUrl,
    date: event.date,
    location: event.location,
    type: event.type,
    status: event.status,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    hasRsvped: userId ? rsvpEventIds.has(event._id.toString()) : false,
  }));
}

export async function createEvent(params: {
  title: string;
  description: string;
  date: Date;
  location: string;
  type: "online" | "physical";
  coverImageUrl?: string;
  meetingLink?: string;
}) {
  await connectToDatabase();
  return Event.create({
    ...params,
    coverImageUrl: params.coverImageUrl ?? null,
    meetingLink: params.meetingLink ?? null,
    status: "scheduled",
  });
}

export async function createRsvp(params: { userId: string; eventId: string }) {
  await connectToDatabase();

  const event = await Event.findById(params.eventId).select("+meetingLink");

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  if (event.status === "cancelled") {
    throw new ApiError(409, "This event has been cancelled.");
  }

  const existingRsvp = await EventRsvp.findOne({
    userId: params.userId,
    eventId: params.eventId,
  });

  if (existingRsvp) {
    throw new ApiError(409, "You have already RSVPed to this event.");
  }

  const rsvp = await EventRsvp.create(params);
  const user = await User.findById(params.userId).select("email name");

  if (user) {
    await queueEmail({
      template: event.type === "online" ? "event-rsvp-digital" : "event-rsvp-physical",
      recipient: user.email,
      payload: {
        userName: user.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        meetingLink: event.meetingLink,
      },
    });
  }

  return rsvp;
}

export async function updateEventDetails(params: {
  eventId: string;
  updates: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
    type?: "online" | "physical";
    coverImageUrl?: string | null;
    meetingLink?: string | null;
    status?: "scheduled" | "updated" | "cancelled";
  };
}) {
  await connectToDatabase();

  const event = await Event.findById(params.eventId).select("+meetingLink");

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  Object.assign(event, params.updates);

  if (!params.updates.status) {
    event.status = "updated";
  }

  await event.save();

  const rsvps = await EventRsvp.find({ eventId: event._id.toString() }).select("userId");
  const userIds = rsvps.map((entry) => entry.userId);

  const isCancelled = event.status === "cancelled";
  const title = isCancelled ? "Event cancelled" : "Event updated";
  const body = isCancelled
    ? `The event "${event.title}" has been cancelled.`
    : `The event "${event.title}" has been updated. Check the new details.`;

  await notifyUsers({
    userIds,
    type: isCancelled ? "event.cancelled" : "event.updated",
    title,
    body,
    link: "/events",
  });

  await queueEmailsForUserIds({
    userIds,
    template: isCancelled ? "event-cancelled" : "event-updated",
    payloadBuilder: (user) => ({
      userName: user.name,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      eventStatus: event.status,
      meetingLink: event.type === "online" ? event.meetingLink : null,
    }),
  });

  return event;
}
