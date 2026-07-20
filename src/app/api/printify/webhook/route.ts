import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { applyPrintifyWebhookEvent } from "@/lib/store/service";

export const runtime = "nodejs";

function verifyPrintifySignature(payload: string, signatureHeader: string | null) {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new ApiError(503, "Printify webhook secret is not configured.");
    }

    return;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    throw new ApiError(400, "Missing Printify signature.");
  }

  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signatureHeader);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new ApiError(400, "Invalid Printify signature.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    verifyPrintifySignature(rawBody, request.headers.get("x-pfy-signature"));
    const event = JSON.parse(rawBody);
    const order = await applyPrintifyWebhookEvent(event);

    return successResponse({
      received: true,
      orderId: order?._id.toString() ?? null,
      eventType: event?.type ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
