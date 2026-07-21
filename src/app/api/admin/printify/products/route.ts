import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { listPrintifyProducts } from "@/lib/printify/client";
import Product from "@/models/Product";
import {
  importAllPrintifyProducts,
  importPrintifyProduct,
  serializeProduct,
} from "@/lib/store/service";

export const runtime = "nodejs";

const importPrintifyProductsSchema = z.object({
  productId: z.string().trim().min(1).optional(),
  all: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 50);
    const products = await listPrintifyProducts(page, limit);
    const printifyProductIds = (products.data ?? []).map((product) => product.id);
    await connectToDatabase();
    const localProducts = await Product.find({
      "printify.productId": { $in: printifyProductIds },
    })
      .select("_id isActive printify")
      .lean();
    const localProductsByPrintifyId = new Map(
      localProducts.map((product) => [product.printify?.productId, product]),
    );

    return successResponse({
      ...products,
      data: (products.data ?? []).map((product) => {
        const localProduct = localProductsByPrintifyId.get(product.id);

        return {
          ...product,
          imported: Boolean(localProduct?.printify?.enabled),
          localProductId: localProduct?._id.toString() ?? null,
          localIsActive: localProduct?.isActive ?? false,
        };
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const body = importPrintifyProductsSchema.parse(await request.json());

    if (body.all) {
      const products = await importAllPrintifyProducts();

      return successResponse({
        message: "Printify products imported.",
        count: products.length,
        products: products.map(serializeProduct),
      });
    }

    if (!body.productId) {
      return successResponse({ message: "No Printify product selected.", product: null });
    }

    const product = await importPrintifyProduct(body.productId);

    return successResponse({
      message: "Printify product imported.",
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
