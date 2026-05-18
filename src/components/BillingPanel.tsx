"use client";

import { useState } from "react";
import { Modal, message as antMessage } from "antd";

type Plan = {
  id: string;
  name: string;
  description: string;
  interval: string;
  accountType: string;
  priceCents: number;
  currency: string;
  discountBadge: string | null;
  stripePriceId: string | null;
};

type Subscription = {
  id: string;
  planType: string;
  expiryDate: string;
  status: string;
  billingStatus: string;
  paymentStatus: string;
} | null;

export function BillingPanel({
  plans,
  subscription,
  history,
}: {
  plans: Plan[];
  subscription: Subscription;
  history: Subscription[];
}) {
  const [message, setMessage] = useState("");
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [portalAction, setPortalAction] = useState<"portal" | "payment" | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  async function checkout(planId: string) {
    setMessage("");
    setCheckoutPlanId(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await response.json();

      if (!response.ok) {
        antMessage.error(result?.error?.message ?? "Checkout failed.");
        return;
      }

      window.location.assign(result.data.checkoutUrl);
    } finally {
      setCheckoutPlanId(null);
    }
  }

  async function openPortal(action: "portal" | "payment") {
    setMessage("");
    setPortalAction(action);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        antMessage.error(result?.error?.message ?? "Billing portal unavailable.");
        return;
      }

      window.location.assign(result.data.portalUrl);
    } finally {
      setPortalAction(null);
    }
  }

  async function cancelSubscription() {
    setMessage("");
    setIsCanceling(true);

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();

      if (!response.ok) {
        antMessage.error(result?.error?.message ?? "Cancellation failed.");
        return;
      }

      setMessage(result.data.message);
      antMessage.success(result.data.message ?? "Subscription canceled.");
    } finally {
      setIsCanceling(false);
    }
  }

  function confirmCancelSubscription() {
    Modal.confirm({
      title: "Cancel auto-renewal?",
      content: "Access continues until the paid period ends.",
      okText: "Cancel Auto-Renewal",
      okButtonProps: { danger: true },
      onOk: cancelSubscription,
    });
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}

      <section className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
        <h2 className="font-bebas text-3xl uppercase leading-none">Current Plan</h2>
        {subscription ? (
          <div className="mt-3 grid gap-2 text-sm">
            <p><strong>Status:</strong> {subscription.status} / {subscription.billingStatus}</p>
            <p><strong>Renews or ends:</strong> {new Date(subscription.expiryDate).toLocaleDateString()}</p>
            <p className="text-[#555]">Subscriptions auto-renew through Stripe unless canceled. Cancellation keeps access through the current paid period.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#555]">No paid subscription is active yet.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => openPortal("portal")}
            disabled={Boolean(portalAction)}
            className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {portalAction === "portal" ? "Opening..." : "Billing Portal"}
          </button>
          <button
            onClick={() => openPortal("payment")}
            disabled={Boolean(portalAction)}
            className="rounded-md border-2 border-[#212121] px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {portalAction === "payment" ? "Opening..." : "Update Payment Method"}
          </button>
          {subscription?.status === "active" ? (
            <button
              onClick={confirmCancelSubscription}
              disabled={isCanceling}
              className="rounded-md border-2 border-[#212121] bg-[#ffe8e6] px-4 py-2 text-sm font-black text-[#8c0504] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCanceling ? "Canceling..." : "Cancel Subscription"}
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bebas text-3xl uppercase leading-none">{plan.name}</p>
                <p className="mt-1 text-sm font-bold uppercase text-[#8c0504]">{plan.accountType} / {plan.interval}</p>
              </div>
              {plan.discountBadge ? <span className="rounded-sm bg-[#faff8d] px-2 py-1 text-xs font-black">{plan.discountBadge}</span> : null}
            </div>
            <p className="mt-3 text-sm text-[#555]">{plan.description}</p>
            <p className="mt-3 font-black">
              {(plan.priceCents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: plan.currency.toUpperCase(),
              })}
            </p>
            <button
              onClick={() => checkout(plan.id)}
              disabled={!plan.stripePriceId || Boolean(checkoutPlanId)}
              className="mt-4 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkoutPlanId === plan.id ? "Opening Checkout..." : "Checkout"}
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
        <h2 className="font-bebas text-3xl uppercase leading-none">Billing History</h2>
        <div className="mt-4 grid gap-2">
          {history.length ? history.map((entry) => (
            <p key={entry?.id} className="text-sm">
              {entry?.planType} / {entry?.status} / {entry ? new Date(entry.expiryDate).toLocaleDateString() : ""}
            </p>
          )) : <p className="text-sm text-[#555]">No subscription history yet.</p>}
        </div>
      </section>
    </div>
  );
}
