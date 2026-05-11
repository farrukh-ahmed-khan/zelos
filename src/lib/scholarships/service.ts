import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import mongoose from "mongoose";
import Scholarship, { type ScholarshipDocument } from "@/models/Scholarship";
import ScholarshipApplication from "@/models/ScholarshipApplication";
import ScholarshipDonation from "@/models/ScholarshipDonation";

export function serializeScholarship(scholarship: ScholarshipDocument) {
  const liveFundCents =
    scholarship.initialFundCents + scholarship.communityDonationCents;
  return {
    id: scholarship._id.toString(),
    name: scholarship.name,
    slug: scholarship.slug,
    description: scholarship.description,
    eligibility: scholarship.eligibility,
    field: scholarship.field,
    awardAmountCents: scholarship.awardAmountCents,
    targetInstitution: scholarship.targetInstitution ?? null,
    initialFundCents: scholarship.initialFundCents,
    communityDonationCents: scholarship.communityDonationCents,
    liveFundCents,
    progressPercent:
      scholarship.awardAmountCents > 0
        ? Math.min(100, Math.round((liveFundCents / scholarship.awardAmountCents) * 100))
        : 0,
    status: scholarship.status,
    managementFeePercent: scholarship.managementFeePercent,
    featured: scholarship.featured,
    createdAt: scholarship.createdAt,
    updatedAt: scholarship.updatedAt,
  };
}

export async function getActiveScholarships(featuredOnly = false) {
  await connectToDatabase();
  return Scholarship.find({
    status: "active",
    ...(featuredOnly ? { featured: true } : {}),
  }).sort({ createdAt: -1 });
}

export async function getScholarshipBySlug(slug: string) {
  await connectToDatabase();
  return Scholarship.findOne({ slug, status: { $ne: "archived" } });
}

export async function getScholarshipByIdOrSlug(idOrSlug: string) {
  await connectToDatabase();
  const bySlug = await Scholarship.findOne({
    slug: idOrSlug,
    status: { $ne: "archived" },
  });

  if (bySlug) {
    return bySlug;
  }

  if (!mongoose.isValidObjectId(idOrSlug)) {
    return null;
  }

  return Scholarship.findOne({ _id: idOrSlug, status: { $ne: "archived" } });
}

export async function createScholarship(params: Record<string, unknown>) {
  await connectToDatabase();
  return Scholarship.create(params);
}

export async function applyForScholarship(scholarshipId: string, params: {
  name: string;
  email: string;
  school: string;
  fieldOfStudy: string;
  gpa?: number;
  personalStatement: string;
  documentUrl?: string;
}) {
  await connectToDatabase();
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship || scholarship.status !== "active") {
    throw new ApiError(404, "Active scholarship not found.");
  }
  const application = await ScholarshipApplication.create({
    scholarshipId,
    ...params,
    documentUrl: params.documentUrl || null,
  });
  await queueEmail({
    template: "scholarship-application-acknowledgment",
    recipient: params.email,
    payload: { name: params.name, scholarshipName: scholarship.name },
  });
  return application;
}

export async function donateToScholarship(scholarshipId: string, params: {
  amountCents: number;
  donorName: string;
  donorEmail: string;
}) {
  await connectToDatabase();
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship || scholarship.status !== "active") {
    throw new ApiError(404, "Active scholarship not found.");
  }
  return ScholarshipDonation.create({ scholarshipId, ...params, status: "pending" });
}

export async function getScholarshipApplications() {
  await connectToDatabase();
  return ScholarshipApplication.find().sort({ createdAt: -1 }).lean();
}
