import { z } from "zod";

export const createSchoolResourceSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(1000).optional(),
    resourceType: z.enum([
      "lesson-plan",
      "teacher-guide",
      "student-worksheet",
      "image",
      "document",
      "spreadsheet",
      "presentation",
    ]),
    audience: z.enum(["teacher", "student"]),
    ageTrack: z.string().trim().min(2).max(60).optional(),
    schoolScope: z
      .enum(["all-schools", "specific-schools", "district"])
      .default("all-schools"),
    schoolIds: z.array(z.string().trim().min(1)).max(100).optional(),
    district: z.string().trim().max(120).optional(),
    releaseDate: z.string().trim().min(1).optional(),
    order: z.number().int().min(1).optional(),
  })
  .superRefine((value, context) => {
    if (value.audience === "student" && !value.ageTrack) {
      context.addIssue({
        code: "custom",
        path: ["ageTrack"],
        message: "Choose an age track for student resources.",
      });
    }
  });
