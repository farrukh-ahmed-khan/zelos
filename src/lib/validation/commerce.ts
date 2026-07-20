import { z } from "zod";

export const createToolkitResourceSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  resourceType: z.enum(["worksheet", "quiz", "budget-template", "goal-setting", "family-prompt"]),
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
  startingAmountCents: z.number().int().min(0).optional(),
  numberOfRecipients: z.number().int().min(1).max(100).optional(),
  applicationDeadline: z.string().datetime(),
  selectionCriteria: z.string().trim().min(10).max(3000),
  applicationRequiresDocument: z.boolean().optional(),
  applicationDocumentLabel: z.string().trim().max(120).optional(),
  ownerName: z.string().trim().max(160).optional(),
  ownerEmail: z.email().trim().toLowerCase().optional().or(z.literal("")),
  status: z.enum(["draft", "active", "closed", "archived"]).optional(),
  featured: z.boolean().optional(),
});

export const updateScholarshipSchema = createScholarshipSchema.partial();

export const scholarshipApplicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  school: z.string().trim().min(2).max(180),
  fieldOfStudy: z.string().trim().min(2).max(120),
  gpa: z.number().min(0).max(4.5).optional(),
  personalStatement: z.string().trim().min(20).max(5000),
  documentUrl: z.url().trim().max(2048).optional(),
  captchaToken: z.string().trim().max(4000).optional(),
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
  scholarshipId: z.string().trim().max(80).optional(),
  captchaToken: z.string().trim().max(4000).optional(),
});

const productImageSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => value.startsWith("/") || z.url().safeParse(value).success,
    "Product images must be an absolute URL or a root-relative public asset path.",
  );

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(5).max(3000),
  priceCents: z.number().int().min(0),
  images: z.array(productImageSchema).max(12).optional(),
  sizes: z.array(z.string().trim().min(1).max(30)).max(20).optional(),
  colors: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().trim().max(80).optional().or(z.literal("")),
        size: z.string().trim().max(30).optional().or(z.literal("")),
        color: z.string().trim().max(40).optional().or(z.literal("")),
        printifyVariantId: z.number().int().min(1).nullable().optional(),
        imageUrl: productImageSchema.nullable().optional().or(z.literal("")),
        inventoryCount: z.number().int().min(0),
        priceAdjustmentCents: z.number().int().min(-100000).max(100000).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .max(200)
    .optional(),
  inventoryCount: z.number().int().min(0),
  limitedEdition: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isGiftCard: z.boolean().optional(),
  printify: z
    .object({
      enabled: z.boolean().optional(),
      productId: z.string().trim().max(120).nullable().optional().or(z.literal("")),
      defaultVariantId: z.number().int().min(1).nullable().optional(),
    })
    .optional(),
});

const addressSchema = z.object({
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  zip: z.string().trim().min(1).max(20),
  country: z.string().trim().max(60).default("US"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  email: z.email().trim().toLowerCase(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  giftCardCode: z.string().trim().max(80).optional(),
  captchaToken: z.string().trim().max(4000).optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(99),
        size: z.string().trim().max(30).optional(),
        color: z.string().trim().max(40).optional(),
        giftCardAmountCents: z.number().int().min(100).max(100000).optional(),
      }),
    )
    .min(1)
    .max(50),
});
