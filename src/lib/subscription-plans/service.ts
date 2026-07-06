import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import SubscriptionPlan, {
  type SubscriptionPlanDocument,
} from "@/models/SubscriptionPlan";
import PromotionCode, { type PromotionCodeDocument } from "@/models/PromotionCode";
import { createStripePromotionCode } from "@/lib/billing/stripe";

export function serializeSubscriptionPlan(plan: SubscriptionPlanDocument) {
  return {
    id: plan._id.toString(),
    name: plan.name,
    description: plan.description,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    ageTrack: plan.ageTrack ?? null,
    stripePriceId: plan.stripePriceId ?? null,
    planKind: plan.planKind ?? "single",
    bundleTracks: plan.bundleTracks ?? [],
    multiSubscriptionDiscountPercent:
      plan.multiSubscriptionDiscountPercent ?? 0,
    allowSeatExpansion: plan.allowSeatExpansion ?? true,
    discountBadge: plan.discountBadge ?? null,
    isPromotional: plan.isPromotional,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export async function getSubscriptionPlans(includeInactive = false) {
  await connectToDatabase();

  return SubscriptionPlan.find(includeInactive ? {} : { isActive: true }).sort({
    interval: 1,
    priceCents: 1,
  });
}

export async function createSubscriptionPlan(params: {
  name: string;
  description: string;
  interval: "monthly" | "annual";
  priceCents: number;
  currency?: string;
  ageTrack?: string;
  stripePriceId?: string;
  planKind?: "single" | "multi-discount" | "bundle";
  bundleTracks?: string[];
  multiSubscriptionDiscountPercent?: number;
  allowSeatExpansion?: boolean;
  discountBadge?: string;
  isPromotional?: boolean;
  isActive?: boolean;
}) {
  await connectToDatabase();

  return SubscriptionPlan.create({
    ...params,
    currency: params.currency ?? "usd",
    ageTrack: params.ageTrack || null,
    stripePriceId: params.stripePriceId || null,
    planKind: params.planKind ?? "single",
    bundleTracks: params.bundleTracks ?? [],
    multiSubscriptionDiscountPercent:
      params.multiSubscriptionDiscountPercent ?? 0,
    allowSeatExpansion: params.allowSeatExpansion ?? true,
    discountBadge: params.discountBadge || null,
    isPromotional: params.isPromotional ?? false,
    isActive: params.isActive ?? true,
  });
}

export async function updateSubscriptionPlan(
  planId: string,
  updates: Partial<{
    name: string;
    description: string;
    interval: "monthly" | "annual";
    priceCents: number;
    currency: string;
    ageTrack: string;
    stripePriceId: string;
    planKind: "single" | "multi-discount" | "bundle";
    bundleTracks: string[];
    multiSubscriptionDiscountPercent: number;
    allowSeatExpansion: boolean;
    discountBadge: string;
    isPromotional: boolean;
    isActive: boolean;
  }>,
) {
  await connectToDatabase();

  const plan = await SubscriptionPlan.findById(planId);

  if (!plan) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  Object.assign(plan, {
    ...updates,
    ageTrack: updates.ageTrack === "" ? null : updates.ageTrack,
    stripePriceId: updates.stripePriceId === "" ? null : updates.stripePriceId,
    bundleTracks: updates.bundleTracks,
    discountBadge: updates.discountBadge === "" ? null : updates.discountBadge,
  });

  await plan.save();
  return plan;
}

export function serializePromotionCode(promotionCode: PromotionCodeDocument) {
  return {
    id: promotionCode._id.toString(),
    code: promotionCode.code,
    name: promotionCode.name,
    discountType: promotionCode.discountType,
    percentOff: promotionCode.percentOff ?? null,
    amountOffCents: promotionCode.amountOffCents ?? null,
    currency: promotionCode.currency,
    stripeCouponId: promotionCode.stripeCouponId ?? null,
    stripePromotionCodeId: promotionCode.stripePromotionCodeId ?? null,
    isActive: promotionCode.isActive,
    createdAt: promotionCode.createdAt,
    updatedAt: promotionCode.updatedAt,
  };
}

export async function getPromotionCodes() {
  await connectToDatabase();

  return PromotionCode.find().sort({ createdAt: -1 }).limit(100);
}

export async function createPromotionCode(params: {
  code: string;
  name: string;
  discountType: "percent" | "amount";
  percentOff?: number;
  amountOffCents?: number;
  currency?: string;
}) {
  await connectToDatabase();

  const code = params.code.trim().toUpperCase();
  const existing = await PromotionCode.findOne({ code });

  if (existing) {
    throw new ApiError(409, "A promotion code with this code already exists.");
  }

  const stripePromotion = await createStripePromotionCode({
    code,
    name: params.name,
    discountType: params.discountType,
    percentOff: params.percentOff ?? null,
    amountOffCents: params.amountOffCents ?? null,
    currency: params.currency ?? "usd",
  });

  return PromotionCode.create({
    code,
    name: params.name,
    discountType: params.discountType,
    percentOff: params.discountType === "percent" ? params.percentOff : null,
    amountOffCents: params.discountType === "amount" ? params.amountOffCents : null,
    currency: params.currency ?? "usd",
    stripeCouponId: stripePromotion.couponId,
    stripePromotionCodeId: stripePromotion.promotionCodeId,
    isActive: true,
  });
}
