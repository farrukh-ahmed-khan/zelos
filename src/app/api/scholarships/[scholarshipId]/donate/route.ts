import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { scholarshipDonationSchema } from "@/lib/validation/commerce";
import { donateToScholarship } from "@/lib/scholarships/service";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ scholarshipId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    enforceRateLimit(`scholarship-donate:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const { scholarshipId } = await context.params;
    const body = scholarshipDonationSchema.parse(await request.json());
    const donation = await donateToScholarship(scholarshipId, body);
    return successResponse(
      {
        message: "Scholarship donation recorded. Payment processing is pending Stripe setup.",
        donationId: donation._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
