import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { requirePremiumAccess } from "@/lib/subscriptions/service";
import { type UserDocument } from "@/models/User";
import ToolkitResource, { type ToolkitResourceDocument } from "@/models/ToolkitResource";
import VideoProgress from "@/models/VideoProgress";

export function serializeToolkitResource(resource: ToolkitResourceDocument, unlocked = true) {
  return {
    id: resource._id.toString(),
    title: resource.title,
    description: resource.description ?? null,
    resourceType: resource.resourceType,
    url: unlocked ? resource.url : null,
    linkedVideoId: resource.linkedVideoId ?? null,
    ageTrack: resource.ageTrack,
    order: resource.order,
    answers: unlocked ? resource.answers ?? [] : [],
    unlocked,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}

export async function createToolkitResource(params: {
  title: string;
  description?: string;
  resourceType: "worksheet" | "quiz" | "budget-template" | "goal-setting" | "family-prompt";
  url: string;
  linkedVideoId?: string;
  ageTrack: string;
  order?: number;
  answers?: string[];
  isActive?: boolean;
}) {
  await connectToDatabase();

  return ToolkitResource.create({
    ...params,
    description: params.description || null,
    linkedVideoId: params.linkedVideoId || null,
    order: params.order ?? 1,
    answers: params.answers ?? [],
    isActive: params.isActive ?? true,
  });
}

export async function getToolkitForUser(user: UserDocument) {
  await requirePremiumAccess(user);
  await connectToDatabase();

  const [resources, progress] = await Promise.all([
    ToolkitResource.find({ ageTrack: user.ageTrack, isActive: true }).sort({
      order: 1,
      createdAt: 1,
    }),
    VideoProgress.find({ userId: user._id.toString(), completed: true }).select("videoId"),
  ]);

  const completedVideoIds = new Set(progress.map((entry) => entry.videoId));

  return resources.map((resource) => {
    const unlocked =
      !resource.linkedVideoId || completedVideoIds.has(resource.linkedVideoId);
    return serializeToolkitResource(resource, unlocked);
  });
}

export async function getUnlockedToolkitDownload(user: UserDocument, resourceId: string) {
  const resources = await getToolkitForUser(user);
  const resource = resources.find((entry) => entry.id === resourceId);

  if (!resource) {
    throw new ApiError(404, "Toolkit resource not found.");
  }

  if (!resource.unlocked || !resource.url) {
    throw new ApiError(403, "Complete the linked lesson to unlock this download.");
  }

  return resource;
}

export async function getToolkitResourcesForAdmin() {
  await connectToDatabase();

  return ToolkitResource.find().sort({ ageTrack: 1, order: 1, resourceType: 1 });
}
