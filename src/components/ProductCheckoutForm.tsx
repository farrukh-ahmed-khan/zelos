"use client";

import { FormEvent, useState } from "react";

export function ProductCheckoutForm({ productId }: { productId: string }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        items: [
          {
            productId,
            quantity: Number(formData.get("quantity") ?? 1),
            size: String(formData.get("size") ?? ""),
            color: String(formData.get("color") ?? ""),
          },
        ],
      }),
    });
    const result = await response.json();
    setMessage(response.ok ? result?.data?.message ?? "Order recorded." : result?.error?.message ?? "Checkout failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      <input name="firstName" placeholder="First name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="lastName" placeholder="Last name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="email" type="email" placeholder="Email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="quantity" type="number" min={1} defaultValue={1} className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="size" placeholder="Size" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="color" placeholder="Color" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111]">
        Guest Checkout
      </button>
    </form>
  );
}
