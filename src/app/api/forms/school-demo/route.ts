import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { createFormSubmission } from "@/lib/forms/service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { publicFormSchema } from "@/lib/validation/forms";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`school-demo:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = publicFormSchema.parse(await request.json());
    const submission = await createFormSubmission({ ...body, type: "school-demo" });
    return successResponse(
      { message: "Demo request sent successfully.", submissionId: submission._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
