import { z } from "zod";

export const updateUserBanSchema = z.object({
  isBanned: z.boolean(),
});

export const createVideoSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(2000),
  ageTrack: z.string().trim().min(2).max(60),
  audience: z
    .enum(["subscriber", "teacher", "student", "public-preview"])
    .optional(),
  category: z.string().trim().min(2).max(120).optional(),
  playlist: z.string().trim().min(2).max(120).optional(),
  schoolScope: z.enum(["global", "all-schools", "specific-schools", "district"]).optional(),
  schoolIds: z.array(z.string().trim().min(1).max(80)).max(100).optional(),
  district: z.string().trim().max(180).optional(),
  order: z.number().int().min(1),
  releaseDate: z.string().trim().min(1).optional(),
  dripEnabled: z.boolean().optional(),
  isFreePreview: z.boolean().optional(),
  isMissionVideo: z.boolean().optional(),
});

export const updateVideoSchema = createVideoSchema
  .partial()
  .extend({
    url: z.string().url().max(2048).optional(),
    s3Key: z.string().trim().max(512).nullable().optional(),
  });

export const createContentCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  playlist: z.string().trim().min(2).max(120),
  ageTrack: z.string().trim().min(2).max(60),
  audience: z.enum(["subscriber", "teacher", "student", "public-preview"]),
  order: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateContentCategorySchema = createContentCategorySchema.partial();

export const createSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(1000),
  interval: z.enum(["monthly", "annual"]),
  priceCents: z.number().int().min(0),
  currency: z.string().trim().length(3).default("usd"),
  ageTrack: z.string().trim().max(60).optional(),
  stripePriceId: z.string().trim().max(180).optional(),
  discountBadge: z.string().trim().max(80).optional(),
  isPromotional: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

export const createAdminInviteSchema = z.object({
  email: z.email().trim().toLowerCase(),
  role: z.enum(["forum-moderator", "sub-admin"]),
  adminPermissions: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export const updateAdminInviteSchema = createAdminInviteSchema.partial().extend({
  deactivate: z.boolean().optional(),
});

export const acceptAdminInviteSchema = z.object({
  token: z.string().trim().min(32),
  name: z.string().trim().min(2).max(120),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number.",
    ),
  age: z.number().int().min(1).max(120),
});

export const createBroadcastSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(5).max(5000),
});

export const resolveForumReportSchema = z.object({
  action: z.enum([
    "dismiss",
    "hide-target",
    "ban-author",
    "hide-target-and-ban-author",
  ]),
  note: z.string().trim().max(1000).optional(),
});
