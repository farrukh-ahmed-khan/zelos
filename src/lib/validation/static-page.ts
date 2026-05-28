import { z } from "zod";

export const upsertStaticPageSchema = z.object({
  slug: z.string().trim().toLowerCase().min(2).max(120).regex(/^[a-z0-9-]+$/),
  eyebrow: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(180),
  intro: z.string().trim().min(10).max(2000),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(180),
        body: z.string().trim().min(10).max(5000),
        points: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
      }),
    )
    .max(20),
  isPublished: z.boolean().optional(),
});
