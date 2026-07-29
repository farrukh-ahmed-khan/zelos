import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import GiftCard from "@/models/GiftCard";

export const runtime = "nodejs";

const balanceSchema = z.object({
  code: z.string().trim().toUpperCase().min(8).max(80),
});

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(
      `gift-card-balance:${request.headers.get("x-forwarded-for") ?? "local"}`,
      8,
      60_000,
    );
    const body = balanceSchema.parse(await request.json());
    await connectToDatabase();

    const giftCard = await GiftCard.findOne({ code: body.code })
      .select("initialAmountCents remainingAmountCents status")
      .lean();

    if (!giftCard) {
      throw new ApiError(404, "Gift card not found. Check the code and try again.");
    }

    return successResponse({
      code: body.code,
      initialAmountCents: giftCard.initialAmountCents,
      remainingAmountCents: giftCard.remainingAmountCents,
      status: giftCard.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
