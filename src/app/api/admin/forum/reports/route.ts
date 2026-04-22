import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getForumReports } from "@/lib/forum/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const reports = await getForumReports();

    return successResponse({
      count: reports.length,
      reports,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
