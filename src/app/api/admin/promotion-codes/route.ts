import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  createPromotionCode,
  getPromotionCodes,
  serializePromotionCode,
} from "@/lib/subscription-plans/service";
import { createPromotionCodeSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const promotionCodes = await getPromotionCodes();

    return successResponse({
      count: promotionCodes.length,
      promotionCodes: promotionCodes.map(serializePromotionCode),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const body = createPromotionCodeSchema.parse(await request.json());
    const promotionCode = await createPromotionCode(body);

    return successResponse(
      {
        message: "Promotion code created successfully.",
        promotionCode: serializePromotionCode(promotionCode),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
