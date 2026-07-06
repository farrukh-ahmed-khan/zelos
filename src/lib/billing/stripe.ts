import axios from "axios";
import { ApiError } from "@/lib/http";

type StripeCheckoutParams = {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  couponId?: string;
  promotionCodeId?: string;
};

type StripeDonationCheckoutParams = {
  amountCents: number;
  donorEmail: string;
  donationId: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
};

type StripeStoreCheckoutParams = {
  amountCents: number;
  customerEmail: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  orderDescription?: string;
};

type StripePortalParams = {
  customerId: string;
  returnUrl: string;
};

async function postStripeForm(path: string, values: Record<string, string>) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new ApiError(
      503,
      "Stripe is not configured. Add STRIPE_SECRET_KEY and Stripe price/customer IDs before using live billing.",
    );
  }

  const body = new URLSearchParams(values);
  const response = await axios.post(`https://api.stripe.com/v1/${path}`, body, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    validateStatus: () => true,
  });

  const data = response.data;

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(response.status, data?.error?.message ?? "Stripe request failed.", data);
  }

  return data as { id: string; url?: string };
}

export async function createStripeCheckoutSession(params: StripeCheckoutParams) {
  const values: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price]": params.priceId,
    "line_items[0][quantity]": "1",
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "subscription_data[metadata][userId]": params.metadata?.userId ?? "",
    "subscription_data[metadata][planId]": params.metadata?.planId ?? "",
    "metadata[userId]": params.metadata?.userId ?? "",
    "metadata[planId]": params.metadata?.planId ?? "",
  };

  for (const [key, value] of Object.entries(params.metadata ?? {})) {
    values[`metadata[${key}]`] = value;
    values[`subscription_data[metadata][${key}]`] = value;
  }

  if (params.couponId) {
    values["discounts[0][coupon]"] = params.couponId;
  }

  if (params.promotionCodeId) {
    values["discounts[0][promotion_code]"] = params.promotionCodeId;
  }

  return postStripeForm("checkout/sessions", values);
}

export async function createStripeAmountOffCoupon(params: {
  amountOffCents: number;
  name: string;
}) {
  return postStripeForm("coupons", {
    amount_off: String(params.amountOffCents),
    currency: "usd",
    duration: "once",
    name: params.name,
  });
}

export async function createStripePromotionCode(params: {
  code: string;
  name: string;
  discountType: "percent" | "amount";
  percentOff?: number | null;
  amountOffCents?: number | null;
  currency?: string;
}) {
  const couponValues: Record<string, string> = {
    duration: "once",
    name: params.name,
  };

  if (params.discountType === "percent") {
    couponValues.percent_off = String(params.percentOff ?? 0);
  } else {
    couponValues.amount_off = String(params.amountOffCents ?? 0);
    couponValues.currency = params.currency ?? "usd";
  }

  const coupon = await postStripeForm("coupons", couponValues);
  const promotionCode = await postStripeForm("promotion_codes", {
    coupon: coupon.id,
    code: params.code.toUpperCase(),
    active: "true",
  });

  return {
    couponId: coupon.id,
    promotionCodeId: promotionCode.id,
  };
}

export async function cancelStripeSubscriptionAtPeriodEnd(subscriptionId: string) {
  return postStripeForm(`subscriptions/${subscriptionId}`, {
    cancel_at_period_end: "true",
  });
}

export async function createStripeDonationCheckoutSession(params: StripeDonationCheckoutParams) {
  const values: Record<string, string> = {
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "Zelos donation",
    "line_items[0][price_data][product_data][description]":
      params.description ?? "Aiding students through Zelos programs",
    "line_items[0][price_data][unit_amount]": String(params.amountCents),
    "line_items[0][quantity]": "1",
    customer_email: params.donorEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "metadata[kind]": "donation",
    "metadata[donationId]": params.donationId,
    "payment_intent_data[metadata][kind]": "donation",
    "payment_intent_data[metadata][donationId]": params.donationId,
  };

  return postStripeForm("checkout/sessions", values);
}

export async function createStripeStoreCheckoutSession(params: StripeStoreCheckoutParams) {
  const values: Record<string, string> = {
    mode: "payment",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "Zelos store order",
    "line_items[0][price_data][product_data][description]": params.orderDescription ?? "Zelos swag store purchase",
    "line_items[0][price_data][unit_amount]": String(params.amountCents),
    "line_items[0][quantity]": "1",
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "metadata[kind]": "store",
    "metadata[orderId]": params.orderId,
    "payment_intent_data[metadata][kind]": "store",
    "payment_intent_data[metadata][orderId]": params.orderId,
  };

  return postStripeForm("checkout/sessions", values);
}

export async function createStripeBillingPortalSession(params: StripePortalParams) {
  return postStripeForm("billing_portal/sessions", {
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}
