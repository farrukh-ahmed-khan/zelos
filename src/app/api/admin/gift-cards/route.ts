import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { createGiftCard } from "@/lib/store/service";
import GiftCard from "@/models/GiftCard";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    await connectToDatabase();
    const giftCards = await GiftCard.find().sort({ createdAt: -1 }).limit(200).lean();
    return successResponse({
      giftCards: giftCards.map((g) => ({
        id: g._id.toString(),
        code: g.code,
        initialAmountCents: g.initialAmountCents,
        remainingAmountCents: g.remainingAmountCents,
        recipientEmail: g.recipientEmail ?? null,
        purchaserEmail: g.purchaserEmail ?? null,
        status: g.status,
        createdAt: g.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const createGiftCardSchema = z.object({
  amountCents: z.number().int().min(100),
  recipientEmail: z.email().trim().toLowerCase().optional(),
  purchaserEmail: z.email().trim().toLowerCase().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const body = createGiftCardSchema.parse(await request.json());
    const giftCard = await createGiftCard(body);
    return successResponse(
      {
        message: "Gift card created successfully.",
        giftCard: {
          id: giftCard._id.toString(),
          code: giftCard.code,
          remainingAmountCents: giftCard.remainingAmountCents,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
