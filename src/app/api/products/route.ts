import { handleApiError, successResponse } from "@/lib/http";
import { getProducts, serializeProduct } from "@/lib/store/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await getProducts();
    return successResponse({
      count: products.length,
      products: products.map(serializeProduct),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
