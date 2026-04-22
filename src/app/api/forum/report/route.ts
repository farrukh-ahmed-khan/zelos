import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { reportPostSchema } from "@/lib/validation/forum";
import { reportForumPost } from "@/lib/forum/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = reportPostSchema.parse(await request.json());

    const report = await reportForumPost({
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      reporterId: user._id.toString(),
    });

    return successResponse(
      {
        message: "Post reported successfully.",
        report: {
          id: report._id.toString(),
          targetType: report.targetType,
          targetId: report.targetId,
          reason: report.reason,
          reporterId: report.reporterId,
          createdAt: report.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
