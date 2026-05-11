import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getUnlockedToolkitDownload } from "@/lib/toolkit/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resourceId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { resourceId } = await context.params;
    const resource = await getUnlockedToolkitDownload(user, resourceId);
    return successResponse({ resource });
  } catch (error) {
    return handleApiError(error);
  }
}
