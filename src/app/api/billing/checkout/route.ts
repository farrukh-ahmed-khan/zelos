import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { createStripeCheckoutSession } from "@/lib/billing/stripe";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { getLatestSubscriptionByUserId } from "@/lib/subscriptions/service";
import { createCheckoutSessionSchema } from "@/lib/validation/billing";
import SubscriptionPlan from "@/models/SubscriptionPlan";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["subscriber"]);
    const body = createCheckoutSessionSchema.parse(await request.json());
    const plan = await SubscriptionPlan.findById(body.planId);

    if (!plan || !plan.isActive) {
      throw new ApiError(404, "Subscription plan not found.");
    }

    if (!plan.stripePriceId) {
      throw new ApiError(422, "This plan is missing a Stripe price ID.");
    }

    if (plan.accountType !== (user.accountType ?? "individual")) {
      throw new ApiError(403, "This plan does not match the account type selected at signup.");
    }

    const latestSubscription = await getLatestSubscriptionByUserId(user._id.toString());

    if (latestSubscription && latestSubscription.expiryDate > new Date()) {
      throw new ApiError(
        409,
        "Plan changes are available after the current paid period expires.",
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const session = await createStripeCheckoutSession({
      priceId: plan.stripePriceId,
      customerEmail: user.email,
      successUrl: `${baseUrl}/billing?checkout=success`,
      cancelUrl: `${baseUrl}/billing?checkout=cancelled`,
      metadata: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
      },
    });

    return successResponse({
      message: "Stripe Checkout session created.",
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
