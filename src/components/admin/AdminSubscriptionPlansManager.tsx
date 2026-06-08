"use client";

import { FormEvent, useState } from "react";
import { message as antMessage } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type Plan = {
  id: string;
  name: string;
  description: string;
  interval: "monthly" | "annual";
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  discountBadge: string | null;
  isPromotional: boolean;
  isActive: boolean;
};

type PromotionCode = {
  id: string;
  code: string;
  name: string;
  discountType: "percent" | "amount";
  percentOff: number | null;
  amountOffCents: number | null;
  currency: string;
  isActive: boolean;
};

export function AdminSubscriptionPlansManager({
  plans,
  promotionCodes,
}: {
  plans: Plan[];
  promotionCodes: PromotionCode[];
}) {
  const [items, setItems] = useState(plans);
  const [codes, setCodes] = useState(promotionCodes);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [isSubmittingPromotion, setIsSubmittingPromotion] = useState(false);
  const [promotionDiscountType, setPromotionDiscountType] =
    useState<PromotionCode["discountType"]>("percent");
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmittingPlan(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await api.post("/api/admin/subscription-plans", {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        interval: String(formData.get("interval") ?? "monthly"),
        priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
        currency: String(formData.get("currency") ?? "usd"),
        stripePriceId: String(formData.get("stripePriceId") ?? ""),
        discountBadge: String(formData.get("discountBadge") ?? ""),
        isPromotional: formData.get("isPromotional") === "on",
        isActive: formData.get("isActive") === "on",
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create plan.");
        return;
      }

      setItems((current) => [result.data.plan, ...current]);
      setMessage("Plan created.");
      form.reset();
    } finally {
      setIsSubmittingPlan(false);
    }
  }

  async function togglePlan(plan: Plan) {
    setMessage("");
    setError("");
    setTogglingPlanId(plan.id);

    try {
      const response = await api.patch(`/api/admin/subscription-plans/${plan.id}`, { isActive: !plan.isActive });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to update plan.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === plan.id ? result.data.plan : item)),
      );
      antMessage.success(plan.isActive ? "Plan deactivated." : "Plan activated.");
    } finally {
      setTogglingPlanId(null);
    }
  }

  async function submitPromotionCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmittingPromotion(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const discountType = String(formData.get("discountType") ?? "percent");

    try {
      const response = await api.post("/api/admin/promotion-codes", {
        code: String(formData.get("code") ?? ""),
        name: String(formData.get("promoName") ?? ""),
        discountType,
        percentOff:
          discountType === "percent" ? Number(formData.get("percentOff") ?? 0) : undefined,
        amountOffCents:
          discountType === "amount"
            ? Math.round(Number(formData.get("amountOffDollars") ?? 0) * 100)
            : undefined,
        currency: String(formData.get("promoCurrency") ?? "usd"),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Unable to create promotion code.");
        return;
      }

      setCodes((current) => [result.data.promotionCode, ...current]);
      setMessage("Promotion code created.");
      form.reset();
      setPromotionDiscountType("percent");
    } finally {
      setIsSubmittingPromotion(false);
    }
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Plan name
          <input name="name" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Price in dollars
          <input name="priceDollars" type="number" min="0" step="0.01" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Description
          <textarea name="description" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Billing interval
          <select name="interval" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal">
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Currency
          <input name="currency" defaultValue="usd" maxLength={3} className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Stripe price ID
          <input name="stripePriceId" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Discount badge
          <input name="discountBadge" placeholder="Example: Save 20%" className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isPromotional" type="checkbox" />
          Promotional
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isActive" type="checkbox" defaultChecked />
          Active
        </label>
        <button disabled={isSubmittingPlan} className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmittingPlan ? "Adding..." : "Add Plan"}
        </button>
      </form>

      <form onSubmit={submitPromotionCode} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="font-bold text-[#111827]">Create Promo Code</p>
          <p className="mt-1 text-sm text-[#555]">Creates a matching one-time Stripe coupon and promotion code.</p>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Promo code
          <input name="code" placeholder="Example: SAVE20" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal uppercase" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Internal name
          <input name="promoName" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Discount type
          <select
            name="discountType"
            value={promotionDiscountType}
            onChange={(event) =>
              setPromotionDiscountType(event.target.value as PromotionCode["discountType"])
            }
            className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
          >
            <option value="percent">Percent off</option>
            <option value="amount">Amount off</option>
          </select>
        </label>
        {promotionDiscountType === "percent" ? (
          <label className="grid gap-2 text-sm font-bold">
            Percent off
            <input name="percentOff" type="number" min="1" max="100" step="1" placeholder="Example: 20" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
          </label>
        ) : (
          <>
            <label className="grid gap-2 text-sm font-bold">
              Amount off in dollars
              <input name="amountOffDollars" type="number" min="1" step="0.01" placeholder="Example: 10" required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Currency
              <input name="promoCurrency" defaultValue="usd" maxLength={3} required className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal" />
            </label>
          </>
        )}
        <button disabled={isSubmittingPromotion} className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmittingPromotion ? "Creating..." : "Create Promo Code"}
        </button>
      </form>

      <section className="grid gap-3 md:grid-cols-2">
        {codes.map((code) => (
          <article key={code.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#111827]">{code.code}</p>
                <p className="mt-1 text-sm text-[#555]">{code.name}</p>
              </div>
              <span className="rounded-sm bg-[#eef2f7] px-2 py-1 text-xs font-black">
                {code.discountType === "percent"
                  ? `${code.percentOff}% off`
                  : `${((code.amountOffCents ?? 0) / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: code.currency.toUpperCase(),
                    })} off`}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {items.map((plan) => (
          <article key={plan.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#111827]">{plan.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-[#667085]">
                  {plan.interval}
                </p>
              </div>
              {plan.discountBadge ? <span className="rounded-sm bg-[#eef2f7] px-2 py-1 text-xs font-black">{plan.discountBadge}</span> : null}
            </div>
            <p className="mt-3 text-sm text-[#555]">{plan.description}</p>
            <p className="mt-3 font-black">
              {(plan.priceCents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: plan.currency.toUpperCase(),
              })}
            </p>
            <p className="mt-1 text-xs text-[#666]">{plan.stripePriceId ?? "Missing Stripe price ID"}</p>
            <button
              onClick={() => togglePlan(plan)}
              disabled={togglingPlanId === plan.id}
              className="mt-4 rounded-md border border-[#cfd4dc] px-3 py-2 text-sm font-bold hover:border-[#8c0504] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {togglingPlanId === plan.id
                ? plan.isActive
                  ? "Deactivating..."
                  : "Activating..."
                : plan.isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
