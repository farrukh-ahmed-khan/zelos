import { type SubscriptionDocument } from "@/models/Subscription";
import { type ResolvedSubscriptionAccess } from "@/lib/subscriptions/types";

export function serializeSubscription(subscription: SubscriptionDocument | null) {
  if (!subscription) {
    return null;
  }

  return {
    id: subscription._id.toString(),
    userId: subscription.userId,
    planType: subscription.planType,
    startDate: subscription.startDate,
    expiryDate: subscription.expiryDate,
    status: subscription.status,
    createdAt: subscription.createdAt,
    updatedAt: subscription.updatedAt,
  };
}

export function serializeResolvedSubscription(
  resolved: ResolvedSubscriptionAccess,
) {
  return {
    hasPremiumAccess: resolved.hasPremiumAccess,
    inGracePeriod: resolved.inGracePeriod,
    inheritedFromParent: resolved.inheritedFromParent,
    effectiveStatus: resolved.effectiveStatus,
    graceExpiresAt: resolved.graceExpiresAt,
    ownerUserId: resolved.ownerUserId,
    subscription: serializeSubscription(resolved.subscription),
  };
}
