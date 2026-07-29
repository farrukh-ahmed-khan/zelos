import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import GiftCard from "@/models/GiftCard";

export const runtime = "nodejs";

const updateGiftCardSchema = z.object({
  status: z.enum(["active", "disabled"]),
});

type RouteContext = {
  params: Promise<{ giftCardId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { giftCardId } = await context.params;
    const body = updateGiftCardSchema.parse(await request.json());

    if (!Types.ObjectId.isValid(giftCardId)) {
      throw new ApiError(400, "Invalid gift card.");
    }

    await connectToDatabase();
    const giftCard = await GiftCard.findById(giftCardId);

    if (!giftCard) {
      throw new ApiError(404, "Gift card not found.");
    }
    if (giftCard.status === "redeemed" && body.status === "active") {
      throw new ApiError(422, "A fully redeemed gift card cannot be reactivated.");
    }

    giftCard.status = body.status;
    await giftCard.save();

    return successResponse({
      message: body.status === "disabled" ? "Gift card disabled." : "Gift card reactivated.",
      giftCard: {
        id: giftCard._id.toString(),
        status: giftCard.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
