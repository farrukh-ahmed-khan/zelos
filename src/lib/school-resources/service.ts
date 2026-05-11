import { connectToDatabase } from "@/lib/db";
import SchoolResource, {
  type SchoolResourceDocument,
} from "@/models/SchoolResource";
import { type UserDocument } from "@/models/User";

export function serializeSchoolResource(resource: SchoolResourceDocument) {
  return {
    id: resource._id.toString(),
    title: resource.title,
    description: resource.description ?? null,
    resourceType: resource.resourceType,
    url: resource.url,
    audience: resource.audience,
    ageTrack: resource.ageTrack,
    schoolScope: resource.schoolScope,
    schoolIds: resource.schoolIds ?? [],
    district: resource.district ?? null,
    releaseDate: resource.releaseDate ?? null,
    order: resource.order,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

export async function createSchoolResource(params: {
  title: string;
  description?: string;
  resourceType: "teacher-training-video" | "lesson-plan" | "teacher-guide" | "student-worksheet";
  url: string;
  audience: "teacher" | "student";
  ageTrack: string;
  schoolScope: "all-schools" | "specific-schools" | "district";
  schoolIds?: string[];
  district?: string;
  releaseDate?: string;
  order?: number;
}) {
  await connectToDatabase();

  return SchoolResource.create({
    ...params,
    description: params.description || null,
    schoolIds: params.schoolIds ?? [],
    district: params.district || null,
    releaseDate: params.releaseDate ? new Date(params.releaseDate) : null,
    order: params.order ?? 1,
  });
}

export async function getSchoolResourcesForUser(user: UserDocument) {
  await connectToDatabase();

  if (!["teacher", "student"].includes(user.role) || !user.schoolId) {
    return [];
  }

  const now = new Date();

  return SchoolResource.find({
    audience: user.role,
    ageTrack: user.ageTrack,
    $or: [
      { releaseDate: null },
      { releaseDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { schoolScope: "all-schools" },
          { schoolScope: "specific-schools", schoolIds: user.schoolId },
        ],
      },
    ],
  }).sort({ order: 1, createdAt: 1 });
}
