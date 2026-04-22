import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import User from "@/models/User";
import Video from "@/models/Video";
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
  order: number;
}) {
  await connectToDatabase();
  return Video.create(params);
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
