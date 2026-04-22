import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  date: z.iso.datetime(),
  location: z.string().trim().min(2).max(255),
  type: z.enum(["online", "physical"]),
});
