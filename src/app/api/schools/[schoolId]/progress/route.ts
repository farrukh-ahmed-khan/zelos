import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { getSchoolProgress } from "@/lib/schools/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ schoolId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { schoolId } = await context.params;

    if (
      user.role !== "teacher" &&
      user.role !== "super-admin" &&
      user.role !== "sub-admin"
    ) {
      throw new ApiError(403, "Only teachers and admins can view school progress.");
    }

    if (user.role === "teacher" && user.schoolId !== schoolId) {
      throw new ApiError(403, "Teachers can only view their own school.");
    }

    const progress = await getSchoolProgress(schoolId);
    return successResponse(progress);
  } catch (error) {
    return handleApiError(error);
  }
}
