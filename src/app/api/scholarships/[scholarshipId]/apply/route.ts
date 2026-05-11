import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { scholarshipApplicationSchema } from "@/lib/validation/commerce";
import { applyForScholarship } from "@/lib/scholarships/service";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ scholarshipId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    enforceRateLimit(`scholarship-apply:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const { scholarshipId } = await context.params;
    const body = scholarshipApplicationSchema.parse(await request.json());
    const application = await applyForScholarship(scholarshipId, body);
    return successResponse(
      {
        message: "Scholarship application submitted successfully.",
        applicationId: application._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
