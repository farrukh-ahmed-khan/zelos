import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import Event from "@/models/Event";
import EventRsvp from "@/models/EventRsvp";

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
    date: event.date,
    location: event.location,
    type: event.type,
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
}) {
  await connectToDatabase();
  return Event.create(params);
}

export async function createRsvp(params: { userId: string; eventId: string }) {
  await connectToDatabase();

  const event = await Event.findById(params.eventId);

  if (!event) {
    throw new ApiError(404, "Event not found.");
  }

  const existingRsvp = await EventRsvp.findOne({
    userId: params.userId,
    eventId: params.eventId,
  });

  if (existingRsvp) {
    throw new ApiError(409, "You have already RSVPed to this event.");
  }

  return EventRsvp.create(params);
}
