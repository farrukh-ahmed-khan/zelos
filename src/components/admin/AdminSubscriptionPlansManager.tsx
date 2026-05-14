"use client";

import { FormEvent, useState } from "react";

type Plan = {
  id: string;
  name: string;
  description: string;
  interval: "monthly" | "annual";
  accountType: "individual" | "family";
  priceCents: number;
  currency: string;
  stripePriceId: string | null;
  discountBadge: string | null;
  isPromotional: boolean;
  isActive: boolean;
};

export function AdminSubscriptionPlansManager({ plans }: { plans: Plan[] }) {
  const [items, setItems] = useState(plans);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/admin/subscription-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        interval: String(formData.get("interval") ?? "monthly"),
        accountType: String(formData.get("accountType") ?? "individual"),
        priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
        currency: String(formData.get("currency") ?? "usd"),
        stripePriceId: String(formData.get("stripePriceId") ?? ""),
        discountBadge: String(formData.get("discountBadge") ?? ""),
        isPromotional: formData.get("isPromotional") === "on",
        isActive: formData.get("isActive") === "on",
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to create plan.");
      return;
    }

    setItems((current) => [result.data.plan, ...current]);
    setMessage("Plan created.");
    form.reset();
  }

  async function togglePlan(plan: Plan) {
    const response = await fetch(`/api/admin/subscription-plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result?.error?.message ?? "Unable to update plan.");
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === plan.id ? result.data.plan : item)),
    );
  }

  return (
    <div className="grid gap-6">
      {message ? <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">{message}</p> : null}
      {error ? <p className="rounded-md bg-[#ffe8e6] px-4 py-3 text-sm font-bold text-[#8c0504]">{error}</p> : null}

      <form onSubmit={submit} className="grid gap-4 rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="name" placeholder="Plan name" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="priceDollars" type="number" min="0" step="0.01" placeholder="Price in dollars" required className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="description" placeholder="Description" required className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <select name="interval" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
        <select name="accountType" className="rounded-md border border-[#d8d2c5] px-3 py-3">
          <option value="individual">Individual</option>
          <option value="family">Family</option>
        </select>
        <input name="currency" defaultValue="usd" maxLength={3} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="stripePriceId" placeholder="Stripe price ID" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="discountBadge" placeholder="Discount badge, e.g. Save 20%" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isPromotional" type="checkbox" />
          Promotional
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="isActive" type="checkbox" defaultChecked />
          Active
        </label>
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">
          Add Plan
        </button>
      </form>

      <section className="grid gap-3 md:grid-cols-2">
        {items.map((plan) => (
          <article key={plan.id} className="rounded-md border border-[#d9dde3] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#111827]">{plan.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-[#667085]">
                  {plan.accountType} / {plan.interval}
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
            <button onClick={() => togglePlan(plan)} className="mt-4 rounded-md border border-[#cfd4dc] px-3 py-2 text-sm font-bold hover:border-[#8c0504]">
              {plan.isActive ? "Deactivate" : "Activate"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
