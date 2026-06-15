import { connectToDatabase } from "@/lib/db";
import SchoolResource, {
  type SchoolResourceDocument,
} from "@/models/SchoolResource";
import School from "@/models/School";
import { type UserDocument } from "@/models/User";
import { uploadToS3 } from "@/lib/aws/s3";

const TEACHER_TRACK = "teacher";

function getAgeTrackAliases(ageTrack: string) {
  const aliases: Record<string, string[]> = {
    child: ["child", "Children"],
    teen: ["teen", "Teens"],
    "young-adult": ["young-adult", "Young Adults"],
    adult: ["adult", "Adults"],
    Children: ["child", "Children"],
    Teens: ["teen", "Teens"],
    "Young Adults": ["young-adult", "Young Adults"],
    Adults: ["adult", "Adults"],
  };

  return aliases[ageTrack] ?? [ageTrack];
}

function schoolLicenseIsActive(school: {
  licenseStatus?: string;
  licenseExpiresAt?: Date | null;
} | null) {
  if (!school || school.licenseStatus !== "active") {
    return false;
  }

  return !school.licenseExpiresAt || school.licenseExpiresAt > new Date();
}

function schoolAllowsStudentTrack(schoolTracks: string[] | undefined, userAgeTrack: string) {
  if (!schoolTracks?.length) {
    return true;
  }

  if (schoolTracks.includes("all")) {
    return true;
  }

  const userTrackAliases = getAgeTrackAliases(userAgeTrack);
  return schoolTracks.some((track) => userTrackAliases.includes(track));
}

export function serializeSchoolResource(resource: SchoolResourceDocument) {
  return {
    id: resource._id.toString(),
    title: resource.title,
    description: resource.description ?? null,
    resourceType: resource.resourceType,
    url: resource.url,
    fileName: resource.fileName ?? null,
    mimeType: resource.mimeType ?? null,
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
  resourceType: "lesson-plan" | "teacher-guide" | "student-worksheet" | "image" | "document" | "spreadsheet" | "presentation";
  file: Buffer;
  fileName: string;
  mimeType: string;
  audience: "teacher" | "student";
  ageTrack?: string;
  schoolScope: "all-schools" | "specific-schools" | "district";
  schoolIds?: string[];
  district?: string;
  releaseDate?: string;
  order?: number;
}) {
  await connectToDatabase();
  const upload = await uploadToS3({
    file: params.file,
    fileName: params.fileName,
    mimeType: params.mimeType,
  });

  return SchoolResource.create({
    title: params.title,
    description: params.description || null,
    resourceType: params.resourceType,
    url: upload.url,
    s3Key: upload.key,
    fileName: params.fileName,
    mimeType: params.mimeType,
    audience: params.audience,
    ageTrack: params.audience === "teacher" ? TEACHER_TRACK : params.ageTrack,
    schoolScope: params.schoolScope,
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
  const school = await School.findById(user.schoolId).select("district assignedTracks licenseStatus licenseExpiresAt").lean();

  if (!school || !schoolLicenseIsActive(school)) {
    return [];
  }

  if (user.role === "student" && !schoolAllowsStudentTrack(school.assignedTracks, user.ageTrack)) {
    return [];
  }

  return SchoolResource.find({
    audience: user.role,
    ...(user.role === "student"
      ? { ageTrack: { $in: getAgeTrackAliases(user.ageTrack) } }
      : {}),
    $or: [
      { releaseDate: null },
      { releaseDate: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { schoolScope: "all-schools" },
          { schoolScope: "district", district: { $in: [null, ""] } },
          { schoolScope: "specific-schools", schoolIds: user.schoolId },
          ...(school?.district
            ? [{ schoolScope: "district", district: school.district }]
            : []),
        ],
      },
    ],
  }).sort({ order: 1, createdAt: 1 });
}

export async function getSchoolResourcesForAdmin() {
  await connectToDatabase();

  return SchoolResource.find().sort({
    audience: 1,
    ageTrack: 1,
    resourceType: 1,
    order: 1,
  });
}
