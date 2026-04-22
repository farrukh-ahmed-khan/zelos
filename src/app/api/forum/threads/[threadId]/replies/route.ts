import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createReplySchema } from "@/lib/validation/forum";
import {
  createForumReply,
  requireForumPostingEligibility,
} from "@/lib/forum/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    threadId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser(request);
    await requireForumPostingEligibility(user);

    const { threadId } = await context.params;
    const body = createReplySchema.parse(await request.json());

    const reply = await createForumReply({
      threadId,
      content: body.content,
      authorId: user._id.toString(),
    });

    return successResponse(
      {
        message: "Reply created successfully.",
        reply: {
          id: reply._id.toString(),
          threadId: reply.threadId,
          content: reply.content,
          authorId: reply.authorId,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
