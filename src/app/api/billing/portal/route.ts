import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { createStripeBillingPortalSession } from "@/lib/billing/stripe";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import User from "@/models/User";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireUser(request, ["subscriber"]);
    const user = await User.findById(authUser._id).select("+stripeCustomerId");

    if (!user?.stripeCustomerId) {
      throw new ApiError(
        422,
        "No Stripe customer is linked yet. Complete checkout before opening the billing portal.",
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const session = await createStripeBillingPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${baseUrl}/billing`,
    });

    return successResponse({
      message: "Stripe Billing Portal session created.",
      portalUrl: session.url,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
