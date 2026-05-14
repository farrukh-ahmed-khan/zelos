import { ApiError } from "@/lib/http";

type StripeCheckoutParams = {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
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
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
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

  return postStripeForm("checkout/sessions", values);
}

export async function createStripeBillingPortalSession(params: StripePortalParams) {
  return postStripeForm("billing_portal/sessions", {
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}
