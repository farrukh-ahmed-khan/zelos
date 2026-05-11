import { z } from "zod";

export const createToolkitResourceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  resourceType: z.enum(["worksheet", "quiz", "budget-template", "goal-setting", "family-prompt"]),
  url: z.url().trim().max(2048),
  linkedVideoId: z.string().trim().min(1).optional(),
  ageTrack: z.string().trim().min(2).max(60),
  order: z.number().int().min(1).optional(),
  answers: z.array(z.string().trim().min(1).max(500)).max(30).optional(),
  isActive: z.boolean().optional(),
});

export const createScholarshipSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10).max(5000),
  eligibility: z.string().trim().min(10).max(3000),
  field: z.string().trim().min(2).max(120),
  awardAmountCents: z.number().int().min(0),
  targetInstitution: z.string().trim().max(180).optional(),
  initialFundCents: z.number().int().min(0).optional(),
  status: z.enum(["draft", "active", "shortlisting", "awarded", "archived"]).optional(),
  featured: z.boolean().optional(),
});

export const scholarshipApplicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  school: z.string().trim().min(2).max(180),
  fieldOfStudy: z.string().trim().min(2).max(120),
  gpa: z.number().min(0).max(4.5).optional(),
  personalStatement: z.string().trim().min(20).max(5000),
  documentUrl: z.url().trim().max(2048).optional(),
});

export const scholarshipDonationSchema = z.object({
  amountCents: z.number().int().min(100),
  donorName: z.string().trim().min(2).max(120),
  donorEmail: z.email().trim().toLowerCase(),
});

export const donationSchema = z.object({
  amountCents: z.number().int().min(100),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.email().trim().toLowerCase(),
  dedication: z.string().trim().max(300).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(5).max(3000),
  priceCents: z.number().int().min(0),
  images: z.array(z.url().trim().max(2048)).max(12).optional(),
  sizes: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
  colors: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  inventoryCount: z.number().int().min(0),
  limitedEdition: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isGiftCard: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  email: z.email().trim().toLowerCase(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  giftCardCode: z.string().trim().max(80).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(99),
        size: z.string().trim().max(30).optional(),
        color: z.string().trim().max(40).optional(),
      }),
    )
    .min(1)
    .max(50),
});
