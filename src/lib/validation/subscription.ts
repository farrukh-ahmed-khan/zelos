import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planType: z.enum(["monthly", "annual"]),
  status: z.enum(["active", "suspended", "canceled"]).optional(),
});
