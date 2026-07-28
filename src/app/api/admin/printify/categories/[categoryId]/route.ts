import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { slugifyCategoryName } from "@/lib/store/service";
import Product from "@/models/Product";
import StoreCategory, { type StoreCategoryDocument } from "@/models/StoreCategory";

export const runtime = "nodejs";

const updateStoreCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

function serializeStoreCategory(category: StoreCategoryDocument) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  };
}

function validateCategoryId(categoryId: string) {
  if (!Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid store category.");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireUser(request, ["super-admin"]);
    const { categoryId } = await context.params;
    const body = updateStoreCategorySchema.parse(await request.json());
    validateCategoryId(categoryId);

    const slug = slugifyCategoryName(body.name);

    if (!slug) {
      throw new ApiError(422, "Category name must include at least one letter or number.");
    }

    await connectToDatabase();

    const category = await StoreCategory.findById(categoryId);

    if (!category) {
      throw new ApiError(404, "Store category not found.");
    }

    const duplicate = await StoreCategory.exists({
      _id: { $ne: category._id },
      slug,
    });

    if (duplicate) {
      throw new ApiError(409, "A store category with this name already exists.");
    }

    const previousName = category.name;
    const previousSlug = category.slug;
    category.name = body.name;
    category.slug = slug;
    await category.save();

    const productResult = await Product.updateMany(
      {
        $or: [{ categorySlug: previousSlug }, { category: previousName }],
      },
      {
        $set: {
          category: category.name,
          categorySlug: category.slug,
          categorySource: "admin",
        },
      },
      { runValidators: true },
    );

    return successResponse({
      message: "Store category updated.",
      category: serializeStoreCategory(category),
      updatedProductCount: productResult.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireUser(request, ["super-admin"]);
    const { categoryId } = await context.params;
    validateCategoryId(categoryId);

    await connectToDatabase();

    const category = await StoreCategory.findByIdAndDelete(categoryId);

    if (!category) {
      throw new ApiError(404, "Store category not found.");
    }

    const productResult = await Product.updateMany(
      {
        $or: [{ categorySlug: category.slug }, { category: category.name }],
      },
      {
        $set: {
          category: "",
          categorySlug: "",
          categorySource: "printify",
        },
      },
      { runValidators: true },
    );

    return successResponse({
      message: "Store category deleted.",
      categoryId,
      unassignedProductCount: productResult.modifiedCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
