import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { hideForumReply } from "@/lib/forum/service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ replyId: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const { replyId } = await context.params;
    const reply = await hideForumReply(replyId);

    return successResponse({
      message: "Reply removed from public forum.",
      replyId: reply._id.toString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
