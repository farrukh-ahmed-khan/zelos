import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import {
  createStripeAmountOffCoupon,
  createStripeCheckoutSession,
} from "@/lib/billing/stripe";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { getLatestSubscriptionByUserId } from "@/lib/subscriptions/service";
import { createCheckoutSessionSchema } from "@/lib/validation/billing";
import GiftCard from "@/models/GiftCard";
import PromotionCode from "@/models/PromotionCode";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import VideoProgress from "@/models/VideoProgress";

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

    const latestSubscription = await getLatestSubscriptionByUserId(user._id.toString());

    if (latestSubscription && latestSubscription.expiryDate > new Date()) {
      throw new ApiError(
        409,
        "Plan changes are available after the current paid period expires.",
      );
    }

    let couponId: string | undefined;
    let promotionCodeId: string | undefined;
    let giftCardCode = "";
    let giftCardAppliedCents = 0;

    if (body.giftCardCode) {
      const giftCard = await GiftCard.findOne({
        code: body.giftCardCode.trim().toUpperCase(),
        status: "active",
      });

      if (!giftCard || giftCard.remainingAmountCents <= 0) {
        throw new ApiError(422, "Gift card is invalid or has no remaining balance.");
      }

      giftCardCode = giftCard.code;
      giftCardAppliedCents = Math.min(giftCard.remainingAmountCents, plan.priceCents);

      const coupon = await createStripeAmountOffCoupon({
        amountOffCents: giftCardAppliedCents,
        name: `Zelos gift card ${giftCard.code}`,
      });
      couponId = coupon.id;
    }

    if (body.promoCode) {
      if (couponId) {
        throw new ApiError(422, "Use either a gift card or a promo code, not both.");
      }

      const promotionCode = await PromotionCode.findOne({
        code: body.promoCode.trim().toUpperCase(),
        isActive: true,
      });

      if (!promotionCode?.stripePromotionCodeId) {
        throw new ApiError(422, "Promotion code is invalid or inactive.");
      }

      promotionCodeId = promotionCode.stripePromotionCodeId;
    }

    if (user.ageTrack !== body.ageTrack) {
      await VideoProgress.deleteMany({ userId: user._id.toString() });
      user.ageTrack = body.ageTrack;
      await user.save();
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
        ageTrack: body.ageTrack,
        giftCardCode,
        giftCardAppliedCents: String(giftCardAppliedCents),
      },
      couponId,
      promotionCodeId,
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
