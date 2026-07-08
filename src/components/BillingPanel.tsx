"use client";

import { useState } from "react";
import { Modal, message as antMessage } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type Plan = {
  id: string;
  name: string;
  description: string;
  interval: string;
  priceCents: number;
  currency: string;
  ageTrack: string | null;
  planKind: "single" | "multi-discount" | "bundle";
  bundleTracks: string[];
  multiSubscriptionDiscountPercent: number;
  allowSeatExpansion: boolean;
  discountBadge: string | null;
  stripePriceId: string | null;
};

type LearnerSeat = {
  label: string;
  email: string;
  ageTrack: "child" | "teen" | "young-adult";
};

type Subscription = {
  id: string;
  planType: string;
  planId: string | null;
  planName: string | null;
  expiryDate: string;
  status: string;
  billingStatus: string;
  paymentStatus: string;
  ageTrack?: string | null;
  seatCount?: number;
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
  const [giftCardCode, setGiftCardCode] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [seatDrafts, setSeatDrafts] = useState<Record<string, LearnerSeat[]>>({});
  const [portalAction, setPortalAction] = useState<"portal" | "payment" | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const currentPlan = subscription
    ? plans.find((plan) => plan.id === subscription.planId) ??
      plans.find((plan) => plan.interval === subscription.planType)
    : null;
  const currentPlanName =
    subscription?.planName ??
    currentPlan?.name ??
    (subscription ? `${subscription.planType} subscription` : null);
  const currentPeriodEndsAt = subscription?.expiryDate
    ? new Date(subscription.expiryDate)
    : null;
  const planChangesLocked =
    Boolean(subscription) &&
    subscription?.status !== "expired" &&
    Boolean(currentPeriodEndsAt && currentPeriodEndsAt > new Date());

  async function checkout(planId: string) {
    setMessage("");
    setCheckoutPlanId(planId);

    try {
      const plan = plans.find((item) => item.id === planId);

      if (!plan) {
        antMessage.error("Plan not found.");
        return;
      }

      const checkoutSeats = getSeatsForPlan(plan);
      const response = await api.post("/api/billing/checkout", {
        planId,
        giftCardCode: giftCardCode.trim() || undefined,
        promoCode: promoCode.trim() || undefined,
        ageTrack: checkoutSeats[0]?.ageTrack ?? "teen",
        seats: checkoutSeats,
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Checkout failed.");
        return;
      }

      window.location.assign(result.data.checkoutUrl);
    } finally {
      setCheckoutPlanId(null);
    }
  }

  function formatTrack(value: string) {
    if (value === "child") return "Children";
    if (value === "teen") return "Teens";
    if (value === "young-adult") return "Young Adults";
    return value;
  }

  function defaultSeatForPlan(plan: Plan, index = 0): LearnerSeat {
    return {
      label: `Learner ${index + 1}`,
      email: "",
      ageTrack:
        plan.planKind === "single" && plan.ageTrack
          ? (plan.ageTrack as LearnerSeat["ageTrack"])
          : "teen",
    };
  }

  function normalizeSeatsForPlan(plan: Plan, draft: LearnerSeat[] = []) {
    if (plan.planKind === "single" && plan.ageTrack) {
      const first = draft[0] ?? defaultSeatForPlan(plan);
      return [
        {
          label: first.label || "Learner 1",
          email: first.email || "",
          ageTrack: plan.ageTrack as LearnerSeat["ageTrack"],
        },
      ];
    }

    if (plan.planKind === "bundle" && plan.bundleTracks.length) {
      return plan.bundleTracks.map((ageTrack, index) => ({
        label: draft[index]?.label || `Learner ${index + 1}`,
        email: draft[index]?.email || "",
        ageTrack: ageTrack as LearnerSeat["ageTrack"],
      }));
    }

    return draft.length ? draft : [defaultSeatForPlan(plan)];
  }

  function getSeatsForPlan(plan: Plan) {
    return normalizeSeatsForPlan(plan, seatDrafts[plan.id]);
  }

  function setSeatForPlan(plan: Plan, index: number, updates: Partial<LearnerSeat>) {
    setSeatDrafts((current) => {
      const nextSeats = normalizeSeatsForPlan(plan, current[plan.id]).map((seat, seatIndex) =>
        seatIndex === index ? { ...seat, ...updates } : seat,
      );

      return {
        ...current,
        [plan.id]: normalizeSeatsForPlan(plan, nextSeats),
      };
    });
  }

  function addSeatForPlan(plan: Plan) {
    setSeatDrafts((current) => {
      const currentSeats = normalizeSeatsForPlan(plan, current[plan.id]);
      const nextSeats = [
        ...currentSeats,
        { label: `Learner ${currentSeats.length + 1}`, email: "", ageTrack: "teen" as const },
      ];

      return {
        ...current,
        [plan.id]: nextSeats.slice(0, 12),
      };
    });
  }

  async function openPortal(action: "portal" | "payment") {
    setMessage("");
    setPortalAction(action);

    try {
      const response = await api.post("/api/billing/portal");
      const result = response.data;

      if (!isApiSuccess(response.status)) {
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
      const response = await api.post("/api/billing/cancel", {});
      const result = response.data;

      if (!isApiSuccess(response.status)) {
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
            <p className="font-black text-[#202020]">{currentPlanName}</p>
            <p><strong>Status:</strong> {subscription.status} / {subscription.billingStatus}</p>
            <p><strong>Renews or ends:</strong> {new Date(subscription.expiryDate).toLocaleDateString()}</p>
            {subscription.ageTrack ? <p><strong>Locked track:</strong> {formatTrack(subscription.ageTrack)}</p> : null}
            {subscription.seatCount ? <p><strong>Learner seats:</strong> {subscription.seatCount}</p> : null}
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
        <div className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111] md:col-span-2 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold">
            Gift card code
            <input
              value={giftCardCode}
              onChange={(event) => setGiftCardCode(event.target.value.toUpperCase())}
              placeholder="ZELOS-XXXX"
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal uppercase"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Promo code
            <input
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
              placeholder="SAVE20"
              className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal uppercase"
            />
          </label>
          <p className="text-xs text-[#666] md:col-span-3">
            Gift cards or promo codes can be applied to the first subscription checkout payment. Learner tracks are locked once checkout completes.
            {planChangesLocked ? ` Plan changes unlock after ${currentPeriodEndsAt?.toLocaleDateString()}.` : ""}
          </p>
        </div>
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-md border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bebas text-3xl uppercase leading-none">{plan.name}</p>
                <p className="mt-1 text-sm font-bold uppercase text-[#8c0504]">{plan.interval}</p>
              </div>
              {plan.discountBadge ? <span className="rounded-sm bg-[#faff8d] px-2 py-1 text-xs font-black">{plan.discountBadge}</span> : null}
            </div>
            <p className="mt-3 text-sm text-[#555]">{plan.description}</p>
            <p className="mt-2 text-xs font-black uppercase text-[#8c0504]">
              {plan.planKind === "bundle"
                ? `Bundle: ${plan.bundleTracks.map(formatTrack).join(" + ")}`
                : plan.planKind === "multi-discount"
                  ? `${plan.multiSubscriptionDiscountPercent}% multi-learner discount`
                  : plan.ageTrack
                    ? formatTrack(plan.ageTrack)
                    : "Choose learner track"}
            </p>
            <p className="mt-3 font-black">
              {(plan.priceCents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: plan.currency.toUpperCase(),
              })}
            </p>
            <button
              onClick={() => checkout(plan.id)}
              disabled={
                !plan.stripePriceId ||
                Boolean(checkoutPlanId) ||
                Boolean(giftCardCode.trim() && promoCode.trim()) ||
                planChangesLocked ||
                (subscription?.status === "active" &&
                  (subscription.planId === plan.id ||
                    (!subscription.planId && subscription.planType === plan.interval)))
              }
              className="mt-4 rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {subscription?.status === "active" &&
              (subscription.planId === plan.id ||
                (!subscription.planId && subscription.planType === plan.interval))
                ? "Current Active Plan"
                : planChangesLocked
                  ? "Available After Current Period"
                : checkoutPlanId === plan.id
                  ? "Opening Checkout..."
                  : "Checkout"}
            </button>
            {!subscription && !planChangesLocked ? (
              <div className="mt-4 grid gap-3 rounded-md border border-[#e4ded1] bg-[#fbf7ef] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase text-[#8c0504]">Learner Profiles</p>
                  {plan.planKind === "multi-discount" ? (
                    <button
                      type="button"
                      onClick={() => addSeatForPlan(plan)}
                      className="rounded-md border border-[#212121] bg-white px-2 py-1 text-xs font-black"
                    >
                      Add Seat
                    </button>
                  ) : null}
                </div>
                {getSeatsForPlan(plan)
                  .slice(0, plan.planKind === "multi-discount" ? 12 : plan.planKind === "bundle" ? plan.bundleTracks.length : 1)
                  .map((seat, index) => (
                  <div key={`${plan.id}-${index}`} className="grid gap-2 md:grid-cols-[1fr_1fr_140px]">
                    <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                      Learner name
                      <input
                        value={seat.label}
                        onChange={(event) => setSeatForPlan(plan, index, { label: event.target.value })}
                        placeholder={`Learner ${index + 1}`}
                        className="rounded-md border border-[#d8d2c5] px-3 py-2 text-sm font-normal normal-case text-[#202020]"
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                      Learner email
                      <input
                        value={seat.email}
                        onChange={(event) => setSeatForPlan(plan, index, { email: event.target.value })}
                        placeholder="Optional"
                        className="rounded-md border border-[#d8d2c5] px-3 py-2 text-sm font-normal normal-case text-[#202020]"
                      />
                    </label>
                    {plan.planKind === "bundle" || (plan.planKind === "single" && plan.ageTrack) ? (
                      <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                        Track
                        <span className="rounded-md border border-[#d8d2c5] bg-white px-3 py-2 text-sm font-bold normal-case text-[#202020]">
                          {formatTrack(plan.planKind === "single" && plan.ageTrack ? plan.ageTrack : seat.ageTrack)}
                        </span>
                      </label>
                    ) : (
                      <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                        Track
                        <select
                          value={seat.ageTrack}
                          onChange={(event) =>
                            setSeatForPlan(plan, index, { ageTrack: event.target.value as LearnerSeat["ageTrack"] })
                          }
                          className="rounded-md border border-[#d8d2c5] px-3 py-2 text-sm font-normal normal-case text-[#202020]"
                        >
                          <option value="child">Children</option>
                          <option value="teen">Teens</option>
                          <option value="young-adult">Young Adults</option>
                        </select>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
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
