import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateOrderStatus } from "@/lib/store/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const updateOrderStatusSchema = z.object({
  status: z.enum(["paid", "processing", "shipped", "delivered", "cancelled"]),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { orderId } = await context.params;
    const body = updateOrderStatusSchema.parse(await request.json());
    const order = await updateOrderStatus({ orderId, status: body.status });

    return successResponse({
      message: "Order status updated successfully.",
      order: {
        id: order._id.toString(),
        status: order.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
