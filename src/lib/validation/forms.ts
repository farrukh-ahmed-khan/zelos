import { z } from "zod";

const honeypot = z.string().max(0).optional();

export const publicFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().trim().toLowerCase(),
  category: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(5000),
  companyWebsite: honeypot,
});

export const dataRequestSchema = publicFormSchema.extend({
  requestType: z.enum([
    "data-access",
    "data-deletion",
    "access",
    "deletion",
    "correction",
    "portability",
  ]),
});

export const contentCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  ageTrack: z.string().trim().min(2).max(60),
  audience: z.enum(["subscriber", "teacher", "student", "public-preview"]),
  order: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});
