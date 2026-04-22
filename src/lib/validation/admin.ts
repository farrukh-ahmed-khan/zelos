import { z } from "zod";

export const updateUserBanSchema = z.object({
  isBanned: z.boolean(),
});

export const createVideoSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(2000),
  url: z.url().trim(),
  ageTrack: z.string().trim().min(2).max(60),
  order: z.number().int().min(1),
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
