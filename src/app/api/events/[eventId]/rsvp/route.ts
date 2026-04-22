import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createRsvp } from "@/lib/events/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { eventId } = await context.params;

    const rsvp = await createRsvp({
      userId: user._id.toString(),
      eventId,
    });

    return successResponse(
      {
        message: "RSVP created successfully. RSVPs cannot be canceled.",
        rsvp: {
          id: rsvp._id.toString(),
          userId: rsvp.userId,
          eventId: rsvp.eventId,
          createdAt: rsvp.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
