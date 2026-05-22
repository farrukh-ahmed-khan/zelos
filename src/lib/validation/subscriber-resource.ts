import { z } from "zod";

export const createSubscriberResourceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  resourceType: z.enum([
    "worksheet",
    "guide",
    "template",
    "image",
    "document",
    "spreadsheet",
    "presentation",
  ]),
  ageTrack: z.string().trim().min(2).max(60).default("all"),
  releaseDate: z.string().trim().min(1).optional(),
  order: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});
