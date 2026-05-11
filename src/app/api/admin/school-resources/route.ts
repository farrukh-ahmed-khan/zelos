import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  createSchoolResource,
  serializeSchoolResource,
} from "@/lib/school-resources/service";
import { createSchoolResourceSchema } from "@/lib/validation/school-resource";

export const runtime = "nodejs";

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
