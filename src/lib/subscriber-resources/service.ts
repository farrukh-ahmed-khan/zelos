import { connectToDatabase } from "@/lib/db";
import { uploadToS3 } from "@/lib/aws/s3";
import { requirePremiumAccess } from "@/lib/subscriptions/service";
import SubscriberResource, {
  type SubscriberResourceDocument,
} from "@/models/SubscriberResource";
import { type UserDocument } from "@/models/User";

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

export function serializeSubscriberResource(resource: SubscriberResourceDocument) {
  return {
    id: resource._id.toString(),
    title: resource.title,
    description: resource.description ?? null,
    resourceType: resource.resourceType,
    url: resource.url,
    fileName: resource.fileName ?? null,
    mimeType: resource.mimeType ?? null,
    ageTrack: resource.ageTrack,
    releaseDate: resource.releaseDate ?? null,
    order: resource.order,
    isActive: resource.isActive,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

export async function createSubscriberResource(params: {
  title: string;
  description?: string;
  resourceType: "worksheet" | "guide" | "template" | "image" | "document" | "spreadsheet" | "presentation";
  file: Buffer;
  fileName: string;
  mimeType: string;
  ageTrack?: string;
  releaseDate?: string;
  order?: number;
  isActive?: boolean;
}) {
  await connectToDatabase();
  const upload = await uploadToS3({
    file: params.file,
    fileName: params.fileName,
    mimeType: params.mimeType,
    keyPrefix: "subscriber-resources",
  });

  return SubscriberResource.create({
    title: params.title,
    description: params.description || null,
    resourceType: params.resourceType,
    url: upload.url,
    s3Key: upload.key,
    fileName: params.fileName,
    mimeType: params.mimeType,
    ageTrack: params.ageTrack || "all",
    releaseDate: params.releaseDate ? new Date(params.releaseDate) : null,
    order: params.order ?? 1,
    isActive: params.isActive ?? true,
  });
}

export async function getSubscriberResourcesForAdmin() {
  await connectToDatabase();

  return SubscriberResource.find().sort({
    ageTrack: 1,
    resourceType: 1,
    order: 1,
  });
}

export async function getSubscriberResourcesForUser(user: UserDocument) {
  await connectToDatabase();

  if (!["subscriber", "child"].includes(user.role)) {
    return [];
  }

  await requirePremiumAccess(user);
  const now = new Date();

  return SubscriberResource.find({
    isActive: true,
    ageTrack: { $in: ["all", ...getAgeTrackAliases(user.ageTrack)] },
    $or: [{ releaseDate: null }, { releaseDate: { $lte: now } }],
  }).sort({ order: 1, createdAt: 1 });
}
