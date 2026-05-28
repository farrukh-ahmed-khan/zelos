import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { createFormSubmission } from "@/lib/forms/service";
import { verifyCaptchaToken } from "@/lib/captcha";
import { enforceRateLimit } from "@/lib/rate-limit";
import { scholarshipFunderLeadSchema } from "@/lib/validation/forms";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`scholarship-inquiry:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = scholarshipFunderLeadSchema.parse(await request.json());
    await verifyCaptchaToken(body.captchaToken);
    const submission = await createFormSubmission({
      type: "scholarship-inquiry",
      name: body.name,
      email: body.email,
      category: body.budgetRange,
      message: body.scholarshipConcept,
      metadata: {
        contact: body.contact,
        intendedAudience: body.intendedAudience,
        budgetRange: body.budgetRange,
        notes: body.notes ?? "",
      },
    });
    return successResponse(
      { message: "Scholarship inquiry sent successfully.", submissionId: submission._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
