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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? request.nextUrl.origin;
    const result = await ensurePrintifyWebhooks({ baseUrl });

    return successResponse({
      message: result.created.length
        ? "Printify webhooks installed."
        : "Printify webhooks already installed.",
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
