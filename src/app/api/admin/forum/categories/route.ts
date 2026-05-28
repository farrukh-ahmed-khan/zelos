import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import {
  createForumCategory,
  getAdminForumCategories,
} from "@/lib/forum/service";
import { createForumCategorySchema } from "@/lib/validation/forum";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const categories = await getAdminForumCategories();

    return successResponse({
      count: categories.length,
      categories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "forum.moderate");
    const body = createForumCategorySchema.parse(await request.json());
    const category = await createForumCategory(body);

    return successResponse(
      {
        message: "Forum category created successfully.",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
