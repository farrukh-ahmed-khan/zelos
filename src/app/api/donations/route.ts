import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import { donationSchema } from "@/lib/validation/commerce";
import Donation from "@/models/Donation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = donationSchema.parse(await request.json());
    await connectToDatabase();
    const donation = await Donation.create(body);
    await queueEmail({
      template: "donation-receipt",
      recipient: body.email,
      payload: {
        donorName: `${body.firstName} ${body.lastName}`,
        amountCents: body.amountCents,
        donationId: donation._id.toString(),
      },
    });
    return successResponse(
      {
        message: "Donation recorded. Payment processing is pending Stripe setup.",
        donationId: donation._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
