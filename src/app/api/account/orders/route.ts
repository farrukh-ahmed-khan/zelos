import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const orders = await Order.find({
      $or: [{ userId: user._id.toString() }, { email: user.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({
      orders: orders.map((order) => ({
        id: order._id.toString(),
        items: order.items,
        subtotalCents: order.subtotalCents,
        discountCents: order.discountCents,
        totalCents: order.totalCents,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
