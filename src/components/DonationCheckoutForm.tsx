"use client";

import { FormEvent, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

const presetAmounts = [10, 25, 50, 100];

export function DonationCheckoutForm() {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const finalAmount = customAmount ? Number(customAmount) : amount;
      const response = await api.post("/api/donations", {
        amountCents: Math.round(finalAmount * 100),
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        dedication: String(formData.get("dedication") ?? ""),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setMessage(result?.error?.message ?? "Unable to start donation checkout.");
        return;
      }

      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        setMessage("Donation recorded, but checkout could not be opened.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitDonation} className="grid gap-4 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
      <div className="grid gap-2">
        <span className="text-sm font-black uppercase text-[#8c0504]">Donation amount</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={`rounded-md border-2 px-4 py-3 text-sm font-black ${
                amount === preset && !customAmount
                  ? "border-[#212121] bg-[#faff8d] text-[#212121]"
                  : "border-[#d8d2c5] bg-white text-[#202020]"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Custom amount
        <input
          type="number"
          min="1"
          step="1"
          value={customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          className="rounded-md border border-[#d8d2c5] px-3 py-3 font-normal"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="firstName" required placeholder="First name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="lastName" required placeholder="Last name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      </div>
      <input name="email" required type="email" placeholder="Email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      <input name="dedication" placeholder="Optional dedication: In honor of / In memory of" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
      {message ? <p className="text-sm font-bold text-[#b22222]">{message}</p> : null}
      <button disabled={isSubmitting} className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:opacity-60">
        {isSubmitting ? "Opening checkout..." : "Donate once"}
      </button>
    </form>
  );
}
