import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  listPrintifyBlueprints,
  listPrintifyPrintProviders,
  listPrintifyShipping,
  listPrintifyVariants,
} from "@/lib/printify/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { searchParams } = new URL(request.url);
    const blueprintId = Number(searchParams.get("blueprintId"));
    const printProviderId = Number(searchParams.get("printProviderId"));
    const includeShipping = searchParams.get("shipping") === "true";

    if (blueprintId && printProviderId && includeShipping) {
      const shipping = await listPrintifyShipping(blueprintId, printProviderId);
      return successResponse({ shipping });
    }

    if (blueprintId && printProviderId) {
      const variants = await listPrintifyVariants(blueprintId, printProviderId);
      return successResponse({ variants });
    }

    if (blueprintId) {
      const printProviders = await listPrintifyPrintProviders(blueprintId);
      return successResponse({ printProviders });
    }

    const blueprints = await listPrintifyBlueprints();
    return successResponse({ blueprints });
  } catch (error) {
    return handleApiError(error);
  }
}
