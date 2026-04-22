import { type SubscriptionDocument } from "@/models/Subscription";

export type ResolvedSubscriptionAccess = {
  hasPremiumAccess: boolean;
  inGracePeriod: boolean;
  inheritedFromParent: boolean;
  effectiveStatus:
    | "active"
    | "grace-period"
    | "expired"
    | "suspended"
    | "canceled"
    | "none";
  graceExpiresAt: Date | null;
  subscription: SubscriptionDocument | null;
  ownerUserId: string | null;
};
