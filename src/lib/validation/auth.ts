import { z } from "zod";
import { SELF_REGISTER_ROLES } from "@/lib/auth/roles";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number.",
    ),
  role: z.enum(SELF_REGISTER_ROLES),
  age: z.number().int().min(1).max(120),
  ageTrack: z.string().trim().min(2).max(60).optional(),
  interests: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number.",
    ),
});

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
    role: z.string(),
    age: z.number().int().min(1).max(120),
    ageTrack: z.string().trim().min(2).max(60).optional(),
    interests: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
    parentId: z.string().trim().min(1).optional(),
    schoolId: z.string().trim().min(1).optional(),
    isBanned: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "child" && !data.parentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["parentId"],
        message: "Child accounts require a parentId.",
      });
    }

    if (["teacher", "student"].includes(data.role) && !data.schoolId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["schoolId"],
        message: "Teacher and student accounts require a schoolId.",
      });
    }
  });

export const createChildSubscriberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  age: z.number().int().min(1).max(120),
  ageTrack: z.string().trim().min(2).max(60).optional(),
});
