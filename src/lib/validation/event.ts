import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  date: z.iso.datetime(),
  location: z.string().trim().min(2).max(255),
  type: z.enum(["online", "physical"]),
  coverImageUrl: z.url().trim().optional(),
  meetingLink: z.url().trim().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
  date: z.iso.datetime().optional(),
  location: z.string().trim().min(2).max(255).optional(),
  type: z.enum(["online", "physical"]).optional(),
  coverImageUrl: z.url().trim().nullable().optional(),
  meetingLink: z.url().trim().nullable().optional(),
  status: z.enum(["scheduled", "updated", "cancelled"]).optional(),
});
