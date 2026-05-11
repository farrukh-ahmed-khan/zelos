import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { createFormSubmission } from "@/lib/forms/service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { dataRequestSchema } from "@/lib/validation/forms";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`data-request:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = dataRequestSchema.parse(await request.json());
    const submissionType =
      body.requestType === "data-deletion" || body.requestType === "deletion"
        ? "data-deletion"
        : "data-access";
    const submission = await createFormSubmission({
      ...body,
      type: submissionType,
      metadata: { requestType: body.requestType },
    });
    return successResponse(
      { message: "Request submitted successfully.", submissionId: submission._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
