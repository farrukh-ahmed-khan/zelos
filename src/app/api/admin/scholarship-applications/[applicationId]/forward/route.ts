import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { markScholarshipApplicationForwarded } from "@/lib/scholarships/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ applicationId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAdminPermission(request, "users.manage-limited");
    const { applicationId } = await context.params;
    const application = await markScholarshipApplicationForwarded(applicationId, user._id.toString());

    return successResponse({
      message: "Application marked as forwarded to the scholarship owner.",
      applicationId: application._id.toString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
