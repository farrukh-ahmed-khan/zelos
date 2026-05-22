import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  getSubscriberResourcesForUser,
  serializeSubscriberResource,
} from "@/lib/subscriber-resources/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request, ["subscriber", "child"]);
    const resources = await getSubscriberResourcesForUser(user);

    return successResponse({
      count: resources.length,
      resources: resources.map(serializeSubscriberResource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
