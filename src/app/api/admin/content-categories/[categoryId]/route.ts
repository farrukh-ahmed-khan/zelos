import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { updateContentCategorySchema } from "@/lib/validation/admin";
import ContentCategory from "@/models/ContentCategory";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { categoryId } = await context.params;
    const parsed = updateContentCategorySchema.parse(await request.json());

    await connectToDatabase();

    const category = await ContentCategory.findByIdAndUpdate(categoryId, parsed, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApiError(404, "Content category not found.");
    }

    return successResponse({
      message: "Content category updated.",
      category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
