import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import User, { type UserDocument } from "@/models/User";
import Subscription, {
  type SubscriptionDocument,
  type SubscriptionPlanType,
} from "@/models/Subscription";
import { SUBSCRIPTION_GRACE_PERIOD_HOURS } from "@/lib/subscriptions/constants";
import { type ResolvedSubscriptionAccess } from "@/lib/subscriptions/types";

function addGracePeriod(expiryDate: Date) {
  return new Date(
    expiryDate.getTime() + SUBSCRIPTION_GRACE_PERIOD_HOURS * 60 * 60 * 1000,
  );
}

function calculateExpiryDate(startDate: Date, planType: SubscriptionPlanType) {
  const expiryDate = new Date(startDate);

  if (planType === "monthly") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    return expiryDate;
  }

  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return expiryDate;
}

export function resolveSubscriptionAccessFromDocument(
  subscription: SubscriptionDocument | null,
): Omit<ResolvedSubscriptionAccess, "inheritedFromParent" | "ownerUserId"> {
  if (!subscription) {
    return {
      hasPremiumAccess: false,
      inGracePeriod: false,
      effectiveStatus: "none",
      graceExpiresAt: null,
      subscription: null,
    };
  }

  const now = new Date();
  const graceExpiresAt = subscription.graceEndsAt ?? addGracePeriod(subscription.expiryDate);

  if (subscription.billingStatus === "suspended" || subscription.status === "suspended") {
    return {
      hasPremiumAccess: false,
      inGracePeriod: false,
      effectiveStatus: "suspended",
      graceExpiresAt,
      subscription,
    };
  }

  if (subscription.status === "canceled") {
    return {
      hasPremiumAccess: false,
      inGracePeriod: false,
      effectiveStatus: "canceled",
      graceExpiresAt,
      subscription,
    };
  }

  if (subscription.expiryDate >= now) {
    return {
      hasPremiumAccess: true,
      inGracePeriod: false,
      effectiveStatus: "active",
      graceExpiresAt,
      subscription,
    };
  }

  if (graceExpiresAt >= now) {
    return {
      hasPremiumAccess: true,
      inGracePeriod: true,
      effectiveStatus: "grace-period",
      graceExpiresAt,
      subscription,
    };
  }

  return {
    hasPremiumAccess: false,
    inGracePeriod: false,
    effectiveStatus: "expired",
    graceExpiresAt,
    subscription,
  };
}

export async function getLatestSubscriptionByUserId(userId: string) {
  await connectToDatabase();

  return Subscription.findOne({ userId }).sort({ createdAt: -1 });
}

export async function resolveSubscriptionAccessForUser(
  user: UserDocument,
): Promise<ResolvedSubscriptionAccess> {
  await connectToDatabase();

  if (user.role === "child" && user.parentId) {
    const parent = await User.findById(user.parentId);

    if (!parent || parent.isBanned) {
      return {
        hasPremiumAccess: false,
        inGracePeriod: false,
        inheritedFromParent: true,
        effectiveStatus: "none",
        graceExpiresAt: null,
        subscription: null,
        ownerUserId: user.parentId,
      };
    }

    const parentSubscription = await getLatestSubscriptionByUserId(
      parent._id.toString(),
    );
    const resolved = resolveSubscriptionAccessFromDocument(parentSubscription);

    return {
      ...resolved,
      inheritedFromParent: true,
      ownerUserId: parent._id.toString(),
    };
  }

  const subscription = await getLatestSubscriptionByUserId(user._id.toString());
  const resolved = resolveSubscriptionAccessFromDocument(subscription);

  return {
    ...resolved,
    inheritedFromParent: false,
    ownerUserId: user._id.toString(),
  };
}

export async function requirePremiumAccess(user: UserDocument) {
  const resolved = await resolveSubscriptionAccessForUser(user);

  if (!resolved.hasPremiumAccess) {
    throw new ApiError(
      403,
      "An active subscription is required to access premium content.",
    );
  }

  return resolved;
}

export async function createSubscriptionForUser(params: {
  user: UserDocument;
  planType: SubscriptionPlanType;
  status?: "active" | "suspended" | "canceled";
}) {
  const { user, planType, status = "active" } = params;

  if (user.role === "child") {
    throw new ApiError(403, "Child accounts cannot access billing.");
  }

  if (user.role !== "subscriber") {
    throw new ApiError(
      403,
      "Only users with the subscriber role can create subscriptions.",
    );
  }

  await connectToDatabase();

  const startDate = new Date();
  const expiryDate = calculateExpiryDate(startDate, planType);
  const graceEndsAt = addGracePeriod(expiryDate);

  return Subscription.create({
    userId: user._id.toString(),
    planType,
    startDate,
    expiryDate,
    status,
    billingStatus: status === "suspended" ? "suspended" : "active",
    paymentStatus: status === "suspended" ? "failed" : "paid",
    graceEndsAt,
    renewalEligibleAt: expiryDate,
  });
}
