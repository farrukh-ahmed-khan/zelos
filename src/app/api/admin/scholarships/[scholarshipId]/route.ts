import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { serializeScholarship, updateScholarship } from "@/lib/scholarships/service";
import { updateScholarshipSchema } from "@/lib/validation/commerce";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ scholarshipId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const { scholarshipId } = await context.params;
    const body = updateScholarshipSchema.parse(await request.json());
    const scholarship = await updateScholarship(scholarshipId, {
      ...body,
      ...(body.ownerEmail !== undefined ? { ownerEmail: body.ownerEmail || null } : {}),
      ...(body.applicationDocumentLabel !== undefined
        ? { applicationDocumentLabel: body.applicationDocumentLabel || null }
        : {}),
      ...(body.applicationDeadline ? { applicationDeadline: new Date(body.applicationDeadline) } : {}),
    });

    return successResponse({
      message: "Scholarship updated successfully.",
      scholarship: serializeScholarship(scholarship),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
