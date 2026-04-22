import { z } from "zod";

const objectIdLikeSchema = z.string().trim().min(1);

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2).max(180),
  teacherLimit: z.number().int().min(1),
  studentLimit: z.number().int().min(1),
  assignedVideoIds: z.array(objectIdLikeSchema).optional(),
});

export const inviteTeacherSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const inviteStudentSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const acceptSchoolInviteSchema = z.object({
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
  ageTrack: z.string().trim().min(2).max(60).optional(),
});
