import { NextRequest } from "next/server";
import { createStripeDonationCheckoutSession } from "@/lib/billing/stripe";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { donationSchema } from "@/lib/validation/commerce";
import Donation from "@/models/Donation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`donation:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = donationSchema.parse(await request.json());
    await connectToDatabase();
    const donation = await Donation.create(body);
    const origin = request.nextUrl.origin;
    const checkout = await createStripeDonationCheckoutSession({
      amountCents: body.amountCents,
      donorEmail: body.email,
      donationId: donation._id.toString(),
      successUrl: `${origin}/donate?status=success&donation=${donation._id.toString()}`,
      cancelUrl: `${origin}/donate?status=cancelled`,
    });
    return successResponse(
      {
        message: "Donation checkout created.",
        donationId: donation._id.toString(),
        checkoutUrl: checkout.url,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
