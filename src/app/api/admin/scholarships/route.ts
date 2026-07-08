import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createScholarshipSchema } from "@/lib/validation/commerce";
import {
  createScholarship,
  getAdminScholarships,
  getScholarshipApplicationsByListing,
  serializeScholarship,
} from "@/lib/scholarships/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const scholarshipId = request.nextUrl.searchParams.get("scholarshipId") ?? undefined;
    const [scholarships, applications] = await Promise.all([
      getAdminScholarships(),
      getScholarshipApplicationsByListing(scholarshipId),
    ]);
    return successResponse({ scholarships, applications });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const body = createScholarshipSchema.parse(await request.json());
    const scholarship = await createScholarship({
      ...body,
      startingAmountCents: body.startingAmountCents ?? body.awardAmountCents,
      ownerEmail: body.ownerEmail || null,
      applicationDocumentLabel: body.applicationDocumentLabel || null,
      applicationDeadline: new Date(body.applicationDeadline),
    });
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
