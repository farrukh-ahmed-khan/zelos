import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  createSchoolResource,
  getSchoolResourcesForAdmin,
  serializeSchoolResource,
} from "@/lib/school-resources/service";
import { createSchoolResourceSchema } from "@/lib/validation/school-resource";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const resources = await getSchoolResourcesForAdmin();

    return successResponse({
      count: resources.length,
      resources: resources.map(serializeSchoolResource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const body = createSchoolResourceSchema.parse(await request.json());
    const resource = await createSchoolResource(body);

    return successResponse(
      {
        message: "School resource created successfully.",
        resource: serializeSchoolResource(resource),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
