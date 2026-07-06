import { NextRequest } from "next/server";
import { createStripeDonationCheckoutSession } from "@/lib/billing/stripe";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyCaptchaToken } from "@/lib/captcha";
import { donationSchema } from "@/lib/validation/commerce";
import Donation from "@/models/Donation";
import Scholarship from "@/models/Scholarship";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`donation:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = donationSchema.parse(await request.json());
    await verifyCaptchaToken(body.captchaToken);
    await connectToDatabase();
    const scholarship = body.scholarshipId
      ? await Scholarship.findOne({ _id: body.scholarshipId, status: "active" })
      : null;
    const donation = await Donation.create({
      ...body,
      purpose: scholarship ? "scholarship" : "general",
      scholarshipId: scholarship?._id.toString() ?? null,
      scholarshipName: scholarship?.name ?? null,
    });
    const origin = request.nextUrl.origin;
    const checkout = await createStripeDonationCheckoutSession({
      amountCents: body.amountCents,
      donorEmail: body.email,
      donationId: donation._id.toString(),
      description: scholarship
        ? `Donation to ${scholarship.name}`
        : "Aiding students through Zelos programs",
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
