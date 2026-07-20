import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  getPrintifyShopId,
  isPrintifyConfigured,
  listPrintifyShops,
  listPrintifyWebhooks,
} from "@/lib/printify/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");

    if (!isPrintifyConfigured()) {
      return successResponse({
        configured: false,
        shopId: getPrintifyShopId() || null,
        shops: [],
        webhooks: [],
      });
    }

    const [shops, webhooks] = await Promise.all([
      listPrintifyShops(),
      listPrintifyWebhooks(),
    ]);

    return successResponse({
      configured: true,
      shopId: getPrintifyShopId(),
      shops,
      webhooks,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
