import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { resolveForumReportSchema } from "@/lib/validation/admin";
import { resolveForumReport } from "@/lib/admin/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const actor = await requireAdminPermission(request, "forum.moderate");
    const { reportId } = await context.params;
    const body = resolveForumReportSchema.parse(await request.json());

    const report = await resolveForumReport({
      reportId,
      actor,
      action: body.action,
      note: body.note,
    });

    return successResponse({
      message: "Forum report moderated successfully.",
      report: {
        id: report._id.toString(),
        targetType: report.targetType,
        targetId: report.targetId,
        status: report.status,
        resolvedBy: report.resolvedBy,
        resolvedAt: report.resolvedAt,
        resolutionNote: report.resolutionNote,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
