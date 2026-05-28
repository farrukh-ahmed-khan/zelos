import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { type UserDocument } from "@/models/User";
import ForumReply from "@/models/ForumReply";
import ForumReport from "@/models/ForumReport";
import ForumCategory from "@/models/ForumCategory";
import ForumThread from "@/models/ForumThread";
import User from "@/models/User";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";

function stripForumMarkdown(content: string) {
  return content
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[Photo]")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

export async function requireForumPostingEligibility(user: UserDocument) {
  if (user.status === "banned" || user.isBanned) {
    throw new ApiError(403, "Banned accounts can read the forum but cannot post or reply.");
  }

  if (user.age < 16) {
    throw new ApiError(403, "Users under 16 cannot create forum posts.");
  }

  if (user.forumPostingRevoked) {
    throw new ApiError(403, "Your forum posting access has been revoked.");
  }
}

export async function getActiveForumCategories() {
  await connectToDatabase();

  const categories = await ForumCategory.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();

  if (categories.length) {
    return categories.map((category) => category.name);
  }

  await ForumCategory.insertMany(
    FORUM_CATEGORIES.map((name, index) => ({
      name,
      order: index + 1,
      isActive: true,
    })),
    { ordered: false },
  ).catch(() => null);

  return [...FORUM_CATEGORIES];
}

export async function getForumThreads() {
  await connectToDatabase();

  const [threads, replies] = await Promise.all([
    ForumThread.find({ isHidden: false }).sort({ createdAt: -1 }).lean(),
    ForumReply.find({ isHidden: false }).sort({ createdAt: 1 }).lean(),
  ]);

  const repliesByThreadId = new Map<string, Array<Record<string, unknown>>>();
  const replyAuthorIds = Array.from(new Set(replies.map((reply) => reply.authorId)));
  const replyAuthors = await User.find({ _id: { $in: replyAuthorIds } })
    .select("name role")
    .lean();
  const replyAuthorById = new Map(
    replyAuthors.map((author) => [
      author._id.toString(),
      { name: author.name, role: author.role },
    ]),
  );

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
      author: replyAuthorById.get(reply.authorId) ?? null,
    });
    repliesByThreadId.set(reply.threadId, list);
  }

  const serializedThreads = threads.map((thread) => ({
    id: thread._id.toString(),
    title: thread.title,
    content: thread.content,
    excerpt: stripForumMarkdown(thread.content),
    category: thread.category,
    authorId: thread.authorId,
    isHidden: thread.isHidden,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    replies: repliesByThreadId.get(thread._id.toString()) ?? [],
  }));

  return Promise.all(serializedThreads.map(async (thread) => {
    const author = await User.findById(thread.authorId).select("name role").lean();
    return {
      ...thread,
      author: author
        ? {
            name: author.name,
            role: author.role,
          }
        : null,
    };
  }));
}

export async function getForumCategorySummary() {
  await connectToDatabase();

  const [categoryNames, threads] = await Promise.all([
    getActiveForumCategories(),
    ForumThread.find({ isHidden: false })
      .select("category updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  return categoryNames.map((category) => {
    const categoryThreads = threads.filter((thread) => thread.category === category);
    const lastThread = categoryThreads[0];

    return {
      category,
      threadCount: categoryThreads.length,
      lastActivityAt: lastThread?.updatedAt ?? lastThread?.createdAt ?? null,
    };
  });
}

export async function createForumThread(params: {
  title: string;
  content: string;
  category: string;
  authorId: string;
}) {
  await connectToDatabase();

  const categories = await getActiveForumCategories();

  if (!categories.includes(params.category)) {
    throw new ApiError(422, "Invalid forum category.");
  }

  return ForumThread.create(params);
}

export async function getAdminForumCategories() {
  await connectToDatabase();

  const categories = await ForumCategory.find().sort({ order: 1, name: 1 }).lean();

  if (categories.length) {
    return categories;
  }

  await getActiveForumCategories();
  return ForumCategory.find().sort({ order: 1, name: 1 }).lean();
}

export async function createForumCategory(params: {
  name: string;
  description?: string | null;
  order?: number;
}) {
  await connectToDatabase();

  return ForumCategory.create({
    name: params.name,
    description: params.description ?? null,
    order: params.order ?? 1,
    isActive: true,
  });
}

export async function updateForumCategory(
  categoryId: string,
  updates: {
    name?: string;
    description?: string | null;
    order?: number;
    isActive?: boolean;
  },
) {
  await connectToDatabase();

  const category = await ForumCategory.findByIdAndUpdate(
    categoryId,
    { $set: updates },
    { new: true },
  );

  if (!category) {
    throw new ApiError(404, "Forum category not found.");
  }

  return category;
}

export async function getForumThreadById(threadId: string) {
  await connectToDatabase();
  const threads = await getForumThreads();
  return threads.find((thread) => thread.id === threadId) ?? null;
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

  const reply = await ForumReply.create(params);
  thread.updatedAt = new Date();
  await thread.save();

  return reply;
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

export async function hideForumThread(threadId: string) {
  await connectToDatabase();
  const thread = await ForumThread.findByIdAndUpdate(
    threadId,
    { $set: { isHidden: true } },
    { new: true },
  );

  if (!thread) {
    throw new ApiError(404, "Thread not found.");
  }

  return thread;
}

export async function hideForumReply(replyId: string) {
  await connectToDatabase();
  const reply = await ForumReply.findByIdAndUpdate(
    replyId,
    { $set: { isHidden: true } },
    { new: true },
  );

  if (!reply) {
    throw new ApiError(404, "Reply not found.");
  }

  return reply;
}
