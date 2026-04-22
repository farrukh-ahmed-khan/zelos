import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(10).max(10000),
  category: z.string().trim().min(2).max(80),
});

export const createReplySchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const reportPostSchema = z.object({
  targetType: z.enum(["thread", "reply"]),
  targetId: z.string().trim().min(1),
  reason: z.string().trim().min(5).max(1000),
});
