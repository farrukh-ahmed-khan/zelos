import { z } from "zod";
import { MENTOR_APPLICATION_STATUSES } from "@/models/MentorApplication";

const expertiseItemSchema = z.string().trim().min(2).max(80);

export const mentorApplicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().min(7).max(30),
  profession: z.string().trim().min(2).max(120),
  organization: z.string().trim().max(120).optional(),
  expertise: z.array(expertiseItemSchema).min(1).max(8),
  experienceYears: z.number().int().min(0).max(80),
  linkedInUrl: z.url().trim().max(300).optional().or(z.literal("")),
  availability: z.string().trim().min(3).max(160),
  whyMentor: z.string().trim().min(20).max(2000),
});

export const updateMentorApplicationSchema = z.object({
  status: z.enum(MENTOR_APPLICATION_STATUSES),
  reviewNote: z.string().trim().max(1000).optional(),
});
