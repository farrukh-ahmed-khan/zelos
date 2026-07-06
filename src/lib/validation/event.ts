import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  date: z.iso.datetime(),
  timezone: z.string().trim().min(2).max(80).optional(),
  location: z.string().trim().min(2).max(255),
  type: z.enum(["online", "physical"]),
  coverImageUrl: z.url().trim().optional(),
  meetingLink: z.url().trim().optional(),
  speakers: z
    .array(z.object({
      name: z.string().trim().min(1).max(120),
      title: z.string().trim().max(160).optional(),
      bio: z.string().trim().max(600).optional(),
      imageUrl: z.url().trim().optional(),
    }))
    .max(12)
    .optional(),
  recap: z.string().trim().max(3000).optional(),
  recapImageUrl: z.url().trim().optional(),
  recapVideoUrl: z.url().trim().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  date: z.iso.datetime().optional(),
  timezone: z.string().trim().min(2).max(80).optional(),
  location: z.string().trim().min(2).max(255).optional(),
  type: z.enum(["online", "physical"]).optional(),
  coverImageUrl: z.url().trim().nullable().optional(),
  meetingLink: z.url().trim().nullable().optional(),
  speakers: z
    .array(z.object({
      name: z.string().trim().min(1).max(120),
      title: z.string().trim().max(160).optional(),
      bio: z.string().trim().max(600).optional(),
      imageUrl: z.url().trim().optional(),
    }))
    .max(12)
    .optional(),
  recap: z.string().trim().max(3000).nullable().optional(),
  recapImageUrl: z.url().trim().nullable().optional(),
  recapVideoUrl: z.url().trim().nullable().optional(),
  status: z.enum(["scheduled", "updated", "cancelled"]).optional(),
});
