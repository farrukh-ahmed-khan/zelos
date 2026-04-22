import { z } from "zod";

export const completeVideoSchema = z.object({
  watchedPercentage: z.number().min(0).max(100),
});
