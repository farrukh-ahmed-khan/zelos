import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { handleApiError, successResponse } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation/commerce";
import { verifyCaptchaToken } from "@/lib/captcha";
import { createStripeStoreCheckoutSession } from "@/lib/billing/stripe";
import { createOrder, markOrderPaid } from "@/lib/store/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(`checkout:${request.headers.get("x-forwarded-for") ?? "local"}`);
    const body = checkoutSchema.parse(await request.json());
    await verifyCaptchaToken(body.captchaToken);
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    let userId: string | null = null;

    if (token) {
      const payload = await verifyAuthToken(token).catch(() => null);
      userId = payload?.sub ?? null;
    }

    const order = await createOrder({
      ...body,
      userId,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress ?? body.shippingAddress,
    });

    if (order.totalCents === 0) {
      await markOrderPaid({ orderId: order._id.toString(), providerPaymentId: "gift-card" });
      return successResponse(
        {
          message: "Order paid with gift card credit.",
          orderId: order._id.toString(),
          checkoutUrl: null,
        },
        { status: 201 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const checkout = await createStripeStoreCheckoutSession({
      amountCents: order.totalCents,
      customerEmail: order.email,
      orderId: order._id.toString(),
      successUrl: `${baseUrl}/store?checkout=success`,
      cancelUrl: `${baseUrl}/store?checkout=cancelled`,
      orderDescription: order.items.map((item) => `${item.quantity}x ${item.name}`).join(", "),
    });

    order.stripeCheckoutSessionId = checkout.id;
    await order.save();

    return successResponse(
      {
        message: "Order recorded. Opening secure checkout.",
        orderId: order._id.toString(),
        checkoutUrl: checkout.url,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
