import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createProductSchema } from "@/lib/validation/commerce";
import { createProduct, getProducts, serializeProduct } from "@/lib/store/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const products = await getProducts(true);
    return successResponse({ count: products.length, products: products.map(serializeProduct) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const body = createProductSchema.parse(await request.json());
    const product = await createProduct(body);
    return successResponse(
      { message: "Product created successfully.", product: serializeProduct(product) },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
