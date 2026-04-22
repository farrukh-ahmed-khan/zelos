import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createThreadSchema } from "@/lib/validation/forum";
import {
  createForumThread,
  getForumThreads,
  requireForumPostingEligibility,
} from "@/lib/forum/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const threads = await getForumThreads();

    return successResponse({
      threads,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    await requireForumPostingEligibility(user);

    const body = createThreadSchema.parse(await request.json());
    const thread = await createForumThread({
      title: body.title,
      content: body.content,
      category: body.category,
      authorId: user._id.toString(),
    });

    return successResponse(
      {
        message: "Thread created successfully.",
        thread: {
          id: thread._id.toString(),
          title: thread.title,
          content: thread.content,
          category: thread.category,
          authorId: thread.authorId,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          replies: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
