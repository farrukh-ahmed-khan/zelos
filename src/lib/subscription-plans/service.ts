import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import SubscriptionPlan, {
  type SubscriptionPlanDocument,
} from "@/models/SubscriptionPlan";

export function serializeSubscriptionPlan(plan: SubscriptionPlanDocument) {
  return {
    id: plan._id.toString(),
    name: plan.name,
    description: plan.description,
    interval: plan.interval,
    accountType: plan.accountType,
    priceCents: plan.priceCents,
    currency: plan.currency,
    ageTrack: plan.ageTrack ?? null,
    stripePriceId: plan.stripePriceId ?? null,
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
    accountType: 1,
    priceCents: 1,
  });
}

export async function createSubscriptionPlan(params: {
  name: string;
  description: string;
  interval: "monthly" | "annual";
  accountType: "individual" | "family";
  priceCents: number;
  currency?: string;
  ageTrack?: string;
  stripePriceId?: string;
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
    accountType: "individual" | "family";
    priceCents: number;
    currency: string;
    ageTrack: string;
    stripePriceId: string;
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
    discountBadge: updates.discountBadge === "" ? null : updates.discountBadge,
  });

  await plan.save();
  return plan;
}
