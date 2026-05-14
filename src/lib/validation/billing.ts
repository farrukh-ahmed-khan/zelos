import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planId: z.string().trim().min(1),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});
