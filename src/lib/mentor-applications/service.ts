import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import MentorApplication, {
  type MentorApplicationDocument,
} from "@/models/MentorApplication";

export function serializeMentorApplication(application: MentorApplicationDocument) {
  return {
    id: application._id.toString(),
    name: application.name,
    email: application.email,
    phone: application.phone,
    profession: application.profession,
    organization: application.organization ?? null,
    expertise: application.expertise ?? [],
    experienceYears: application.experienceYears,
    linkedInUrl: application.linkedInUrl ?? null,
    availability: application.availability,
    whyMentor: application.whyMentor,
    status: application.status,
    reviewNote: application.reviewNote ?? null,
    reviewedBy: application.reviewedBy ?? null,
    reviewedAt: application.reviewedAt ?? null,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

export async function createMentorApplication(params: {
  name: string;
  email: string;
  phone: string;
  profession: string;
  organization?: string;
  expertise: string[];
  experienceYears: number;
  linkedInUrl?: string;
  availability: string;
  whyMentor: string;
}) {
  await connectToDatabase();

  const existingApplication = await MentorApplication.findOne({
    email: params.email,
  });

  if (existingApplication) {
    throw new ApiError(
      409,
      "A mentor application with this email already exists.",
    );
  }

  return MentorApplication.create({
    ...params,
    organization: params.organization || null,
    linkedInUrl: params.linkedInUrl || null,
    status: "pending",
  });
}

export async function getMentorApplications(status?: string | null) {
  await connectToDatabase();

  return MentorApplication.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .exec();
}

export async function updateMentorApplication(params: {
  applicationId: string;
  actorId: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
  reviewNote?: string;
}) {
  await connectToDatabase();

  const application = await MentorApplication.findById(params.applicationId);

  if (!application) {
    throw new ApiError(404, "Mentor application not found.");
  }

  application.status = params.status;
  application.reviewNote = params.reviewNote ?? null;
  application.reviewedBy = params.actorId;
  application.reviewedAt = new Date();

  await application.save();
  return application;
}
