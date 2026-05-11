import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/commerce";
import { createOrder } from "@/lib/store/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`checkout:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = checkoutSchema.parse(await request.json());
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let userId: string | null = null;

    if (token) {
      const payload = await verifyAuthToken(token).catch(() => null);
      userId = payload?.sub ?? null;
    }

    const order = await createOrder({ ...body, userId });
    return successResponse(
      {
        message: "Order recorded. Payment processing is pending Stripe setup.",
        orderId: order._id.toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
