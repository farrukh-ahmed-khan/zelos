import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateEventSchema } from "@/lib/validation/event";
import { updateEventDetails } from "@/lib/events/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "events.manage");
    const { eventId } = await context.params;
    const body = updateEventSchema.parse(await request.json());

    const event = await updateEventDetails({
      eventId,
      updates: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        timezone: body.timezone,
        location: body.location,
        type: body.type,
        coverImageUrl: body.coverImageUrl,
        meetingLink: body.meetingLink,
        speakers: body.speakers,
        recap: body.recap,
        recapImageUrl: body.recapImageUrl,
        recapVideoUrl: body.recapVideoUrl,
        status: body.status,
      },
    });

    return successResponse({
      message:
        event.status === "cancelled"
          ? "Event cancelled successfully."
          : "Event updated successfully.",
      event: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        coverImageUrl: event.coverImageUrl,
        date: event.date,
        timezone: event.timezone,
        location: event.location,
        type: event.type,
        meetingLink: event.meetingLink,
        status: event.status,
        speakers: event.speakers,
        recap: event.recap,
        recapImageUrl: event.recapImageUrl,
        recapVideoUrl: event.recapVideoUrl,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
