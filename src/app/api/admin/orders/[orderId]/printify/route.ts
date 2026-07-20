import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { submitPaidOrderToPrintify } from "@/lib/store/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { orderId } = await context.params;
    const order = await submitPaidOrderToPrintify(orderId);

    return successResponse({
      message: "Order sent to Printify.",
      order: {
        id: order._id.toString(),
        status: order.status,
        printify: order.printify ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
