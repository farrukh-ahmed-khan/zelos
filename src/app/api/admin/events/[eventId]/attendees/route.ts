import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getEventAttendees } from "@/lib/events/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "events.manage");
    const { eventId } = await context.params;
    const attendees = await getEventAttendees(eventId);
    return successResponse({ count: attendees.length, attendees });
  } catch (error) {
    return handleApiError(error);
  }
}
