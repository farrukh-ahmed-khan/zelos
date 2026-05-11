import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createScholarshipSchema } from "@/lib/validation/commerce";
import { createScholarship, getScholarshipApplications, serializeScholarship } from "@/lib/scholarships/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const applications = await getScholarshipApplications();
    return successResponse({ applications });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const body = createScholarshipSchema.parse(await request.json());
    const scholarship = await createScholarship(body);
    return successResponse(
      {
        message: "Scholarship created successfully.",
        scholarship: serializeScholarship(scholarship),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
