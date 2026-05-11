import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createFormSubmission } from "@/lib/forms/service";
import { publicFormSchema } from "@/lib/validation/forms";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`contact:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = publicFormSchema.parse(await request.json());
    const submission = await createFormSubmission({ ...body, type: "contact" });
    return successResponse(
      { message: "Message sent successfully.", submissionId: submission._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
