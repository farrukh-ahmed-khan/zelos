import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { createEventSchema } from "@/lib/validation/event";
import { createEvent, getEventsWithRsvpStatus } from "@/lib/events/service";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let userId: string | undefined;

    if (token) {
      try {
        const payload = await verifyAuthToken(token);

        if (payload.sub) {
          await connectToDatabase();
          const user = await User.findById(payload.sub);

          if (user && !user.isBanned && user.status !== "banned") {
            userId = user._id.toString();
          }
        }
      } catch {
        userId = undefined;
      }
    }

    const events = await getEventsWithRsvpStatus(userId);

    return successResponse({
      events,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ADMIN_ROLES);
    const body = createEventSchema.parse(await request.json());

    const event = await createEvent({
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
          hasRsvped: false,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
