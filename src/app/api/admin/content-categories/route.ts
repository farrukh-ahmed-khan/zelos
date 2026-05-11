import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { createContentCategoryByAdmin } from "@/lib/admin/service";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { createContentCategorySchema } from "@/lib/validation/admin";
import ContentCategory from "@/models/ContentCategory";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    await connectToDatabase();

    const categories = await ContentCategory.find()
      .sort({ audience: 1, ageTrack: 1, order: 1, name: 1 })
      .lean();

    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const parsed = createContentCategorySchema.parse(await request.json());
    const category = await createContentCategoryByAdmin(parsed);

    return successResponse(
      {
        message: "Content category created.",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
