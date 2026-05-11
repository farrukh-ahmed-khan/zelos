import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  getSchoolResourcesForUser,
  serializeSchoolResource,
} from "@/lib/school-resources/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request, ["teacher", "student"]);
    const resources = await getSchoolResourcesForUser(user);

    return successResponse({
      count: resources.length,
      resources: resources.map(serializeSchoolResource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
