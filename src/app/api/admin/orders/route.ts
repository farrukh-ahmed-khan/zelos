import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import Order from "@/models/Order";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    await connectToDatabase();

    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return successResponse({
      orders: orders.map((order) => ({
        id: order._id.toString(),
        email: order.email,
        firstName: order.firstName,
        lastName: order.lastName,
        items: order.items,
        subtotalCents: order.subtotalCents,
        discountCents: order.discountCents ?? 0,
        totalCents: order.totalCents,
        giftCardCode: order.giftCardCode ?? null,
        status: order.status,
        shippingAddress: order.shippingAddress ?? null,
        printify: order.printify ?? null,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
