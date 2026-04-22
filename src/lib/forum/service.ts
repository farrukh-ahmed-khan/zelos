import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import ForumReply from "@/models/ForumReply";
import ForumReport from "@/models/ForumReport";
import ForumThread from "@/models/ForumThread";

export async function requireForumPostingEligibility(user: UserDocument) {
  if (user.age < 16) {
    throw new ApiError(403, "Users under 16 cannot create forum posts.");
  }
}

export async function getForumThreads() {
  await connectToDatabase();

  const [threads, replies] = await Promise.all([
    ForumThread.find({ isHidden: false }).sort({ createdAt: -1 }).lean(),
    ForumReply.find({ isHidden: false }).sort({ createdAt: 1 }).lean(),
  ]);

  const repliesByThreadId = new Map<string, Array<Record<string, unknown>>>();

  for (const reply of replies) {
    const list = repliesByThreadId.get(reply.threadId) ?? [];
    list.push({
      id: reply._id.toString(),
      threadId: reply.threadId,
      content: reply.content,
      authorId: reply.authorId,
      isHidden: reply.isHidden,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    });
    repliesByThreadId.set(reply.threadId, list);
  }

  return threads.map((thread) => ({
    id: thread._id.toString(),
    title: thread.title,
    content: thread.content,
    category: thread.category,
    authorId: thread.authorId,
    isHidden: thread.isHidden,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    replies: repliesByThreadId.get(thread._id.toString()) ?? [],
  }));
}

export async function createForumThread(params: {
  title: string;
  content: string;
  category: string;
  authorId: string;
}) {
  await connectToDatabase();
  return ForumThread.create(params);
}

export async function createForumReply(params: {
  threadId: string;
  content: string;
  authorId: string;
}) {
  await connectToDatabase();

  const thread = await ForumThread.findOne({
    _id: params.threadId,
    isHidden: false,
  });

  if (!thread) {
    throw new ApiError(404, "Thread not found.");
  }

  return ForumReply.create(params);
}

export async function reportForumPost(params: {
  targetType: "thread" | "reply";
  targetId: string;
  reason: string;
  reporterId: string;
}) {
  await connectToDatabase();

  const targetExists =
    params.targetType === "thread"
      ? await ForumThread.exists({ _id: params.targetId })
      : await ForumReply.exists({ _id: params.targetId });

  if (!targetExists) {
    throw new ApiError(404, "Reported post not found.");
  }

  return ForumReport.create(params);
}

export async function getForumReports() {
  await connectToDatabase();

  const reports = await ForumReport.find().sort({ createdAt: -1 }).lean();

  return Promise.all(
    reports.map(async (report) => {
      const target =
        report.targetType === "thread"
          ? await ForumThread.findById(report.targetId).lean()
          : await ForumReply.findById(report.targetId).lean();

      return {
        id: report._id.toString(),
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        reporterId: report.reporterId,
        status: report.status,
        resolvedBy: report.resolvedBy,
        resolvedAt: report.resolvedAt,
        resolutionNote: report.resolutionNote,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        target: target
          ? {
              id: target._id.toString(),
              authorId: target.authorId,
              content: "content" in target ? target.content : null,
              title: "title" in target ? target.title : null,
              isHidden: target.isHidden,
            }
          : null,
      };
    }),
  );
}
