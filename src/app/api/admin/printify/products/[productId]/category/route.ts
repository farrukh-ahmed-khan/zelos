import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { serializeProduct } from "@/lib/store/service";
import Product from "@/models/Product";
import StoreCategory from "@/models/StoreCategory";

export const runtime = "nodejs";

const assignStoreCategorySchema = z.object({
  categoryId: z.string().trim().min(1),
});

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireUser(request, ["super-admin"]);
    const { productId } = await context.params;
    const body = assignStoreCategorySchema.parse(await request.json());

    if (!Types.ObjectId.isValid(body.categoryId)) {
      throw new ApiError(400, "Invalid store category.");
    }

    await connectToDatabase();
    const category = await StoreCategory.findOne({
      _id: body.categoryId,
      isActive: true,
    });

    if (!category) {
      throw new ApiError(404, "Store category not found.");
    }

    const product = await Product.findOneAndUpdate(
      { "printify.productId": productId },
      {
        $set: {
          category: category.name,
          categorySlug: category.slug,
          categorySource: "admin",
        },
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new ApiError(409, "Import this Printify product before assigning a category.");
    }

    return successResponse({
      message: "Product category updated.",
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
