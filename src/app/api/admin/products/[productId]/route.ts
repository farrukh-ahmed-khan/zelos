import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createProductSchema } from "@/lib/validation/commerce";
import { deleteProduct, serializeProduct, updateProduct } from "@/lib/store/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { productId } = await context.params;
    const body = createProductSchema.partial().parse(await request.json());
    const product = await updateProduct(productId, body);

    return successResponse({
      message: "Product updated successfully.",
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { productId } = await context.params;
    await deleteProduct(productId);

    return successResponse({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
