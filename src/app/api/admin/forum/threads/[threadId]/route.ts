import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { hideForumThread } from "@/lib/forum/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ threadId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const { threadId } = await context.params;
    const thread = await hideForumThread(threadId);

    return successResponse({
      message: "Thread removed from public forum.",
      threadId: thread._id.toString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
