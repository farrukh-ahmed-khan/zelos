import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getSchoolStudents } from "@/lib/schools/service";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ schoolId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "schools.manage");
    const { schoolId } = await context.params;
    const students = await getSchoolStudents(schoolId);
    return successResponse({ count: students.length, students: students.map(serializeUser) });
  } catch (error) {
    return handleApiError(error);
  }
}
