import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planId: z.string().trim().min(1),
  giftCardCode: z.string().trim().max(80).optional(),
  promoCode: z.string().trim().max(80).optional(),
  ageTrack: z.enum(["child", "teen", "young-adult"]),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
