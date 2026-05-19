import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import Event from "@/models/Event";
import EventRsvp from "@/models/EventRsvp";
import User from "@/models/User";
import { notifyUsers, queueEmail, queueEmailsForUserIds } from "@/lib/notifications/service";

type EventSpeaker = {
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
};

function serializeEvent(event: {
  _id: { toString(): string };
  title: string;
  description: string;
  coverImageUrl?: string | null;
  date: Date;
  timezone?: string | null;
  location: string;
  type: "online" | "physical";
  status: "scheduled" | "updated" | "cancelled";
  speakers?: EventSpeaker[];
  recap?: string | null;
  recapImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  meetingLink?: string | null;
}) {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    coverImageUrl: event.coverImageUrl ?? null,
    date: event.date,
    timezone: event.timezone ?? "America/New_York",
    location: event.location,
    type: event.type,
    status: event.status,
    speakers: event.speakers ?? [],
    recap: event.recap ?? null,
    recapImageUrl: event.recapImageUrl ?? null,
    meetingLink: event.meetingLink ?? null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function getEventsWithRsvpStatus(userId?: string) {
  await connectToDatabase();

  const [events, rsvps] = await Promise.all([
    Event.find().sort({ date: 1, createdAt: -1 }).lean(),
    userId ? EventRsvp.find({ userId }).lean() : Promise.resolve([]),
  ]);

  const rsvpEventIds = new Set(rsvps.map((rsvp) => rsvp.eventId));

  return events.map((event) => ({
    ...serializeEvent(event),
    meetingLink: null,
    hasRsvped: userId ? rsvpEventIds.has(event._id.toString()) : false,
  }));
}

export async function getAdminEvents() {
  await connectToDatabase();

  const events = await Event.find()
    .select("+meetingLink")
    .sort({ date: 1, createdAt: -1 })
    .lean();

  const counts = await EventRsvp.aggregate([
    { $group: { _id: "$eventId", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((entry) => [entry._id, entry.count]));

  return events.map((event) => ({
    ...serializeEvent(event),
    rsvpCount: countById.get(event._id.toString()) ?? 0,
  }));
}

export async function getEventWithRsvpStatus(eventId: string, userId?: string) {
  await connectToDatabase();
  const [event, rsvpCount, userRsvp] = await Promise.all([
    Event.findById(eventId).lean(),
    EventRsvp.countDocuments({ eventId }),
    userId ? EventRsvp.findOne({ eventId, userId }).lean() : Promise.resolve(null),
  ]);

  if (!event) {
    return null;
  }

  return {
    ...serializeEvent(event),
    meetingLink: null,
    rsvpCount,
    hasRsvped: Boolean(userRsvp),
  };
}

export async function getEventAttendees(eventId: string) {
  await connectToDatabase();
  const rsvps = await EventRsvp.find({ eventId }).sort({ createdAt: -1 }).lean();
  const users = await User.find({ _id: { $in: rsvps.map((rsvp) => rsvp.userId) } })
    .select("name email role")
    .lean();
  const userById = new Map(users.map((user) => [user._id.toString(), user]));

  return rsvps.map((rsvp) => ({
    id: rsvp._id.toString(),
    createdAt: rsvp.createdAt,
    user: userById.get(rsvp.userId) ?? null,
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
  timezone?: string;
  speakers?: EventSpeaker[];
  recap?: string;
  recapImageUrl?: string;
}) {
  await connectToDatabase();
  return Event.create({
    ...params,
    coverImageUrl: params.coverImageUrl ?? null,
    meetingLink: params.meetingLink ?? null,
    timezone: params.timezone ?? "America/New_York",
    speakers: params.speakers ?? [],
    recap: params.recap || null,
    recapImageUrl: params.recapImageUrl || null,
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
      template: event.type === "online" ? "digital-event-link-delivery" : "physical-event-rsvp-confirmation",
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
    timezone?: string;
    location?: string;
    type?: "online" | "physical";
    coverImageUrl?: string | null;
    meetingLink?: string | null;
    speakers?: EventSpeaker[];
    recap?: string | null;
    recapImageUrl?: string | null;
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
