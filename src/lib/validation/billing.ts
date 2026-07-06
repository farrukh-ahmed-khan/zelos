import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planId: z.string().trim().min(1),
  giftCardCode: z.string().trim().max(80).optional(),
  promoCode: z.string().trim().max(80).optional(),
  ageTrack: z.enum(["child", "teen", "young-adult"]),
  seats: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        email: z.email().trim().toLowerCase().optional().or(z.literal("")),
        ageTrack: z.enum(["child", "teen", "young-adult"]),
      }),
    )
    .min(1)
    .max(12)
    .optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
