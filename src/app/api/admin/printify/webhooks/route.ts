import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { ensurePrintifyWebhooks, listPrintifyWebhooks } from "@/lib/printify/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const webhooks = await listPrintifyWebhooks();

    return successResponse({ webhooks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
    const configuredUrl = configuredBaseUrl ? new URL(configuredBaseUrl) : null;
    const isUnsafeProductionUrl =
      process.env.NODE_ENV === "production" &&
      configuredUrl &&
      (configuredUrl.protocol !== "https:" ||
        ["localhost", "127.0.0.1", "::1"].includes(configuredUrl.hostname));
    const baseUrl =
      configuredBaseUrl && !isUnsafeProductionUrl
        ? configuredBaseUrl
        : request.nextUrl.origin;
    const result = await ensurePrintifyWebhooks({ baseUrl });
    const changedCount = result.created.length + result.updated.length;

    return successResponse({
      message: changedCount
        ? "Printify webhooks installed and updated."
        : "Printify webhooks already installed.",
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
