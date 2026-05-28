import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { getAdminAnalyticsOverview } from "@/lib/analytics/overview";
import { handleApiError, successResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "analytics.read");
    return successResponse(await getAdminAnalyticsOverview());
  } catch (error) {
    return handleApiError(error);
  }
}
