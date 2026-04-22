import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createEventSchema } from "@/lib/validation/event";
import { createAdminEvent } from "@/lib/admin/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "events.manage");
    const body = createEventSchema.parse(await request.json());

    const event = await createAdminEvent({
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      location: body.location,
      type: body.type,
      coverImageUrl: body.coverImageUrl,
      meetingLink: body.meetingLink,
    });

    return successResponse(
      {
        message: "Event created successfully.",
        event: {
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
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
