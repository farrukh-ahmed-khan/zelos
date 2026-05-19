import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import User from "@/models/User";
import Video from "@/models/Video";
import ContentCategory from "@/models/ContentCategory";
import BroadcastMessage from "@/models/BroadcastMessage";
import { createEvent } from "@/lib/events/service";
import ForumReply from "@/models/ForumReply";
import ForumReport from "@/models/ForumReport";
import ForumThread from "@/models/ForumThread";
import Subscription from "@/models/Subscription";
import VideoProgress from "@/models/VideoProgress";
import EventRsvp from "@/models/EventRsvp";
import SchoolInvite from "@/models/SchoolInvite";
import { notifyUsers, queueEmailsForUserIds } from "@/lib/notifications/service";
import { uploadToS3, deleteFromS3 } from "@/lib/aws/s3";

function canManageUser(actor: UserDocument, target: UserDocument) {
  if (actor._id.toString() === target._id.toString()) {
    return true;
  }

  if (actor.role === "super-admin") {
    return true;
  }

  if (actor.role === "sub-admin" && target.role === "super-admin") {
    return false;
  }

  return actor.role === "sub-admin";
}

async function dropLegacyContentCategoryIndex() {
  try {
    await ContentCategory.collection.dropIndex("name_1_ageTrack_1_audience_1");
  } catch (error) {
    const mongoError = error as { codeName?: string };
    if (mongoError.codeName !== "IndexNotFound") {
      throw error;
    }
  }
}

async function dropLegacyVideoOrderIndex() {
  try {
    await Video.collection.dropIndex("audience_1_ageTrack_1_order_1");
  } catch (error) {
    const mongoError = error as { codeName?: string };
    if (mongoError.codeName !== "IndexNotFound") {
      throw error;
    }
  }
}

export async function updateUserBanStatus(params: {
  actor: UserDocument;
  userId: string;
  isBanned: boolean;
}) {
  await connectToDatabase();

  const target = await User.findById(params.userId);

  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  if (!canManageUser(params.actor, target)) {
    throw new ApiError(403, "You are not allowed to manage this user.");
  }

  target.isBanned = params.isBanned;
  target.status = params.isBanned ? "banned" : "active";
  await target.save();

  return target;
}

export async function deleteUserWithRelations(params: {
  actor: UserDocument;
  userId: string;
}) {
  await connectToDatabase();

  const target = await User.findById(params.userId);

  if (!target) {
    throw new ApiError(404, "User not found.");
  }

  if (!canManageUser(params.actor, target)) {
    throw new ApiError(403, "You are not allowed to manage this user.");
  }

  const targetId = target._id.toString();
  const childUsers =
    target.role === "subscriber"
      ? await User.find({ parentId: targetId, role: "child" }).select("_id")
      : [];
  const childIds = childUsers.map((child) => child._id.toString());

  await Promise.all([
    User.deleteOne({ _id: target._id }),
    ...(childIds.length
      ? [
          User.deleteMany({ _id: { $in: childIds } }),
          VideoProgress.deleteMany({ userId: { $in: childIds } }),
        ]
      : []),
    Subscription.deleteMany({ userId: targetId }),
    VideoProgress.deleteMany({ userId: targetId }),
    EventRsvp.deleteMany({ userId: targetId }),
    SchoolInvite.deleteMany({ invitedBy: targetId }),
    ForumThread.updateMany({ authorId: targetId }, { $set: { isHidden: true } }),
    ForumReply.updateMany({ authorId: targetId }, { $set: { isHidden: true } }),
    ForumReport.updateMany(
      { reporterId: targetId },
      { $set: { status: "dismissed", resolvedBy: params.actor._id.toString(), resolvedAt: new Date() } },
    ),
  ]);

  return target;
}

export async function createVideoByAdmin(params: {
  title: string;
  description: string;
  url: string;
  ageTrack: string;
  audience?: "subscriber" | "teacher" | "student" | "public-preview";
  category?: string;
  playlist?: string;
  schoolScope?: "global" | "all-schools" | "specific-schools" | "district";
  schoolIds?: string[];
  district?: string;
  order: number;
  releaseDate?: Date | null;
  dripEnabled?: boolean;
  dripDelayMinutes?: number;
  isFreePreview?: boolean;
  isMissionVideo?: boolean;
}) {
  await connectToDatabase();
  await dropLegacyVideoOrderIndex();

  return Video.create({
    ...params,
    schoolScope: params.schoolScope ?? "global",
    schoolIds: params.schoolIds ?? [],
    district: params.district || null,
  });
}

export async function updateVideoByAdmin(params: {
  videoId: string;
  updates: Partial<{
    title: string;
    description: string;
    url: string;
    ageTrack: string;
    audience: "subscriber" | "teacher" | "student" | "public-preview";
    category: string;
    playlist: string;
    schoolScope: "global" | "all-schools" | "specific-schools" | "district";
    schoolIds: string[];
    district: string | null;
    order: number;
    releaseDate: Date | null;
    dripEnabled: boolean;
    dripDelayMinutes: number;
    isFreePreview: boolean;
    isMissionVideo: boolean;
    attachmentUrl: string | null;
    attachmentS3Key: string | null;
    attachmentFileName: string | null;
    attachmentMimeType: string | null;
    s3Key: string | null;
  }>;
}) {
  await connectToDatabase();

  if (params.updates.isMissionVideo) {
    await Video.updateMany(
      { _id: { $ne: params.videoId }, isMissionVideo: true },
      { $set: { isMissionVideo: false } },
    );
  }

  const video = await Video.findByIdAndUpdate(params.videoId, params.updates, {
    new: true,
    runValidators: true,
  });

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return video;
}

export async function deleteVideoByAdmin(videoId: string) {
  await connectToDatabase();

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  if (video.s3Key) {
    await deleteFromS3(video.s3Key);
  }

  if (video.attachmentS3Key) {
    await deleteFromS3(video.attachmentS3Key);
  }

  await Video.deleteOne({ _id: video._id });

  return video;
}

export async function createContentCategoryByAdmin(params: {
  name: string;
  playlist: string;
  ageTrack: string;
  audience: "subscriber" | "teacher" | "student" | "public-preview";
  order?: number;
  isActive?: boolean;
}) {
  await connectToDatabase();
  await dropLegacyContentCategoryIndex();

  return ContentCategory.create({
    ...params,
    order: params.order ?? 1,
    isActive: params.isActive ?? true,
  });
}

export async function createVideoByAdminWithUpload(params: {
  title: string;
  description: string;
  ageTrack: string;
  audience?: "subscriber" | "teacher" | "student" | "public-preview";
  category?: string;
  playlist?: string;
  schoolScope?: "global" | "all-schools" | "specific-schools" | "district";
  schoolIds?: string[];
  district?: string;
  order: number;
  releaseDate?: Date | null;
  dripEnabled?: boolean;
  dripDelayMinutes?: number;
  isFreePreview?: boolean;
  isMissionVideo?: boolean;
  attachmentFile?: Buffer;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
}) {
  await connectToDatabase();
  await dropLegacyVideoOrderIndex();

  // Upload file to S3
  const { url, key } = await uploadToS3({
    file: params.file,
    fileName: params.fileName,
    mimeType: params.mimeType,
  });
  const attachment =
    params.attachmentFile && params.attachmentFileName && params.attachmentMimeType
      ? await uploadToS3({
          file: params.attachmentFile,
          fileName: params.attachmentFileName,
          mimeType: params.attachmentMimeType,
        })
      : null;

  // Create video record with S3 URL
  const video = await Video.create({
    title: params.title,
    description: params.description,
    url,
    ageTrack: params.ageTrack,
    audience: params.audience ?? "subscriber",
    category: params.category ?? "General",
    playlist: params.playlist ?? "General",
    schoolScope: params.schoolScope ?? "global",
    schoolIds: params.schoolIds ?? [],
    district: params.district || null,
    order: params.order,
    releaseDate: params.releaseDate ?? null,
    dripEnabled: params.dripEnabled ?? true,
    dripDelayMinutes: params.dripDelayMinutes ?? 0,
    isFreePreview: params.isFreePreview ?? false,
    isMissionVideo: params.isMissionVideo ?? false,
    attachmentUrl: attachment?.url ?? null,
    attachmentS3Key: attachment?.key ?? null,
    attachmentFileName: params.attachmentFileName ?? null,
    attachmentMimeType: params.attachmentMimeType ?? null,
    s3Key: key, // Store the S3 key for future deletion if needed
  });

  return video;
}

export async function createBroadcastMessage(params: {
  title: string;
  content: string;
  sentBy: string;
}) {
  await connectToDatabase();
  const broadcast = await BroadcastMessage.create(params);

  const recipients = await User.find({
    status: { $ne: "banned" },
    isBanned: false,
  })
    .select("_id")
    .lean();

  const userIds = recipients.map((user) => user._id.toString());

  await notifyUsers({
    userIds,
    type: "admin.broadcast",
    title: params.title,
    body: params.content,
    link: "/dashboard",
  });

  await queueEmailsForUserIds({
    userIds,
    template: "admin-broadcast",
    payloadBuilder: (user) => ({
      userName: user.name,
      title: params.title,
      content: params.content,
    }),
  });

  return broadcast;
}

export async function createAdminEvent(params: {
  title: string;
  description: string;
  date: Date;
  location: string;
  type: "online" | "physical";
  coverImageUrl?: string;
  meetingLink?: string;
  timezone?: string;
  speakers?: Array<{ name: string; title?: string; bio?: string; imageUrl?: string }>;
  recap?: string;
  recapImageUrl?: string;
}) {
  return createEvent(params);
}

export async function resolveForumReport(params: {
  reportId: string;
  actor: UserDocument;
  action: "dismiss" | "hide-target" | "ban-author" | "hide-target-and-ban-author";
  note?: string;
}) {
  await connectToDatabase();

  const report = await ForumReport.findById(params.reportId);

  if (!report) {
    throw new ApiError(404, "Forum report not found.");
  }

  const target =
    report.targetType === "thread"
      ? await ForumThread.findById(report.targetId)
      : await ForumReply.findById(report.targetId);

  if (!target) {
    throw new ApiError(404, "Reported target not found.");
  }

  if (
    params.action === "hide-target" ||
    params.action === "hide-target-and-ban-author"
  ) {
    target.isHidden = true;
    await target.save();
  }

  if (
    params.action === "ban-author" ||
    params.action === "hide-target-and-ban-author"
  ) {
    const author = await User.findById(target.authorId);

    if (author) {
      author.forumPostingRevoked = true;
      await author.save();
    }
  }

  report.status = params.action === "dismiss" ? "dismissed" : "resolved";
  report.resolvedBy = params.actor._id.toString();
  report.resolvedAt = new Date();
  report.resolutionNote = params.note ?? null;
  await report.save();

  return report;
}
