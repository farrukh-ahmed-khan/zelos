import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import mongoose from "mongoose";
import Scholarship, { type ScholarshipDocument } from "@/models/Scholarship";
import ScholarshipApplication from "@/models/ScholarshipApplication";

export function serializeScholarship(scholarship: ScholarshipDocument) {
  return {
    id: scholarship._id.toString(),
    name: scholarship.name,
    slug: scholarship.slug,
    description: scholarship.description,
    eligibility: scholarship.eligibility,
    field: scholarship.field,
    awardAmountCents: scholarship.awardAmountCents,
    numberOfRecipients: scholarship.numberOfRecipients,
    applicationDeadline: scholarship.applicationDeadline,
    selectionCriteria: scholarship.selectionCriteria,
    applicationRequiresDocument: scholarship.applicationRequiresDocument,
    applicationDocumentLabel: scholarship.applicationDocumentLabel ?? null,
    ownerName: scholarship.ownerName ?? null,
    ownerEmail: scholarship.ownerEmail ?? null,
    status: scholarship.status,
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

export async function updateScholarship(scholarshipId: string, params: Record<string, unknown>) {
  await connectToDatabase();
  if (!mongoose.isValidObjectId(scholarshipId)) {
    throw new ApiError(404, "Scholarship not found.");
  }
  const scholarship = await Scholarship.findByIdAndUpdate(scholarshipId, params, {
    new: true,
    runValidators: true,
  });
  if (!scholarship) {
    throw new ApiError(404, "Scholarship not found.");
  }
  return scholarship;
}

export async function getAdminScholarships() {
  await connectToDatabase();
  const scholarships = await Scholarship.find().sort({ createdAt: -1 });
  const applicationCounts = await ScholarshipApplication.aggregate([
    { $group: { _id: "$scholarshipId", count: { $sum: 1 } } },
  ]);
  const counts = new Map(applicationCounts.map((item) => [String(item._id), item.count]));

  return scholarships.map((scholarship) => ({
    ...serializeScholarship(scholarship),
    applicationCount: counts.get(scholarship._id.toString()) ?? 0,
  }));
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
  if (scholarship.applicationDeadline < new Date()) {
    throw new ApiError(409, "This scholarship is no longer accepting applications.");
  }
  if (scholarship.applicationRequiresDocument && !params.documentUrl) {
    throw new ApiError(422, "This scholarship requires an application document.");
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

export async function getScholarshipApplications() {
  await connectToDatabase();
  return ScholarshipApplication.find().sort({ createdAt: -1 }).lean();
}

export async function getScholarshipApplicationsByListing(scholarshipId?: string) {
  await connectToDatabase();
  const filter = scholarshipId ? { scholarshipId } : {};
  const applications = await ScholarshipApplication.find(filter).sort({ createdAt: -1 }).lean();
  const scholarshipIds = [...new Set(applications.map((application) => application.scholarshipId))];
  const scholarships = await Scholarship.find({ _id: { $in: scholarshipIds } }).lean();
  const scholarshipMap = new Map(scholarships.map((scholarship) => [scholarship._id.toString(), scholarship]));

  return applications.map((application) => ({
    ...application,
    id: application._id.toString(),
    scholarship: scholarshipMap.get(application.scholarshipId)
      ? {
          id: application.scholarshipId,
          name: scholarshipMap.get(application.scholarshipId)?.name,
          slug: scholarshipMap.get(application.scholarshipId)?.slug,
          ownerName: scholarshipMap.get(application.scholarshipId)?.ownerName ?? null,
          ownerEmail: scholarshipMap.get(application.scholarshipId)?.ownerEmail ?? null,
        }
      : null,
  }));
}

export async function markScholarshipApplicationForwarded(applicationId: string, forwardedBy: string) {
  await connectToDatabase();
  if (!mongoose.isValidObjectId(applicationId)) {
    throw new ApiError(404, "Application not found.");
  }
  const application = await ScholarshipApplication.findByIdAndUpdate(
    applicationId,
    { status: "forwarded", forwardedAt: new Date(), forwardedBy },
    { new: true },
  );
  if (!application) {
    throw new ApiError(404, "Application not found.");
  }
  return application;
}
