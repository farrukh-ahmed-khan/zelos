import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateForumCategory } from "@/lib/forum/service";
import { updateForumCategorySchema } from "@/lib/validation/forum";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const { categoryId } = await context.params;
    const body = updateForumCategorySchema.parse(await request.json());
    const category = await updateForumCategory(categoryId, body);

    return successResponse({
      message: "Forum category updated successfully.",
      category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
