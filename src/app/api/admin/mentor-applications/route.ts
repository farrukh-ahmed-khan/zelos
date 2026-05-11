import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  getMentorApplications,
  serializeMentorApplication,
} from "@/lib/mentor-applications/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");

    const status = request.nextUrl.searchParams.get("status");
    const applications = await getMentorApplications(status);

    return successResponse({
      count: applications.length,
      applications: applications.map(serializeMentorApplication),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
