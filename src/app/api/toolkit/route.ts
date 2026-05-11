import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getToolkitForUser } from "@/lib/toolkit/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const resources = await getToolkitForUser(user);
    return successResponse({ count: resources.length, resources });
  } catch (error) {
    return handleApiError(error);
  }
}
