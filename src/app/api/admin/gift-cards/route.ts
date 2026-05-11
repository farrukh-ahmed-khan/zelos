import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createGiftCard } from "@/lib/store/service";

export const runtime = "nodejs";

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
