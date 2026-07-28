import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { slugifyCategoryName } from "@/lib/store/service";
import StoreCategory, { type StoreCategoryDocument } from "@/models/StoreCategory";

export const runtime = "nodejs";

const createStoreCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

function serializeStoreCategory(category: StoreCategoryDocument) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireUser(request, ["super-admin"]);
    await connectToDatabase();
    const categories = await StoreCategory.find({ isActive: true }).sort({ name: 1 });

    return successResponse({
      count: categories.length,
      categories: categories.map(serializeStoreCategory),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(request, ["super-admin"]);
    const body = createStoreCategorySchema.parse(await request.json());
    const slug = slugifyCategoryName(body.name);

    if (!slug) {
      throw new ApiError(422, "Category name must include at least one letter or number.");
    }

    await connectToDatabase();

    if (await StoreCategory.exists({ slug })) {
      throw new ApiError(409, "A store category with this name already exists.");
    }

    const category = await StoreCategory.create({
      name: body.name,
      slug,
      isActive: true,
    });

    return successResponse(
      {
        message: "Store category created.",
        category: serializeStoreCategory(category),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
