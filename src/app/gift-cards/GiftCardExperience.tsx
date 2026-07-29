"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, isApiSuccess } from "@/lib/api/client";
import { loadCart, money, saveCart } from "@/lib/cart";

const PRESET_AMOUNTS = [25, 50, 100, 250];
const inputClass =
  "w-full rounded-md border-2 border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8c0504]";
const labelClass = "grid gap-1.5 text-xs font-black uppercase tracking-wider text-[#555]";

type BalanceResult = {
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  status: string;
};

export function GiftCardExperience() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [balance, setBalance] = useState<BalanceResult | null>(null);
  const [balanceMessage, setBalanceMessage] = useState("");
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const amountDollars = useMemo(() => {
    const custom = Number(customAmount);
    return customAmount && Number.isFinite(custom) ? custom : selectedAmount;
  }, [customAmount, selectedAmount]);
  const amountCents = Math.round(amountDollars * 100);

  function selectPreset(amount: number) {
    setSelectedAmount(amount);
    setCustomAmount("");
  }

  function addGiftCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPurchaseError("");

    if (amountCents < 1000 || amountCents > 100000) {
      setPurchaseError("Choose an amount between $10 and $1,000.");
      return;
    }

    const currentCart = loadCart();
    saveCart([
      ...currentCart,
      {
        productId: "__gift_card__",
        name: `${money(amountCents)} Zelos Gift Card`,
        priceCents: amountCents,
        quantity: 1,
        giftCardAmountCents: amountCents,
        giftCardRecipientName: recipientName.trim(),
        giftCardRecipientEmail: recipientEmail.trim().toLowerCase(),
        giftCardSenderName: senderName.trim(),
        giftCardPurchaserEmail: senderEmail.trim().toLowerCase(),
        giftCardMessage: message.trim(),
      },
    ]);
    router.push("/store/cart");
  }

  async function checkBalance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBalance(null);
    setBalanceMessage("");
    setIsCheckingBalance(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await api.post("/api/gift-cards/balance", {
        code: String(formData.get("code") ?? ""),
      });

      if (!isApiSuccess(response.status)) {
        setBalanceMessage(response.data?.error?.message ?? "Unable to check this gift card.");
        return;
      }

      setBalance(response.data.data);
    } catch {
      setBalanceMessage("Unable to check this gift card right now.");
    } finally {
      setIsCheckingBalance(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
      <form
        onSubmit={addGiftCard}
        className="rounded-2xl border-2 border-[#212121] bg-white p-5 shadow-[0_5px_0_#111] sm:p-7"
      >
        <p className="eyebrow-red">Create Your Gift</p>
        <h2 className="font-bebas text-4xl uppercase leading-none">Personalize a Gift Card</h2>

        <fieldset className="mt-6">
          <legend className="text-xs font-black uppercase tracking-wider text-[#555]">
            Choose an amount
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => selectPreset(amount)}
                aria-pressed={!customAmount && selectedAmount === amount}
                className={`rounded-md border-2 px-4 py-3 font-black shadow-[0_3px_0_#111] transition ${
                  !customAmount && selectedAmount === amount
                    ? "border-[#212121] bg-[#faff8d] text-[#212121]"
                    : "border-[#d8d2c5] bg-white text-[#555] hover:border-[#212121]"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <label className="mt-3 grid gap-1.5 text-xs font-black uppercase tracking-wider text-[#555]">
            Or enter a custom amount
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#777]">$</span>
              <input
                type="number"
                min={10}
                max={1000}
                step={1}
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder="10–1,000"
                className={`${inputClass} pl-8`}
              />
            </div>
          </label>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Recipient name
            <input
              required
              maxLength={120}
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Alex Morgan"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Recipient email
            <input
              required
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="alex@example.com"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Your name
            <input
              required
              maxLength={120}
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Jordan Smith"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Your email
            <input
              required
              type="email"
              value={senderEmail}
              onChange={(event) => setSenderEmail(event.target.value)}
              placeholder="jordan@example.com"
              className={inputClass}
            />
          </label>
        </div>

        <label className={`${labelClass} mt-4`}>
          Personal message <span className="font-normal normal-case">(optional)</span>
          <textarea
            rows={4}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="A short note for the recipient…"
            className={`${inputClass} resize-y`}
          />
          <span className="text-right font-normal normal-case text-[#999]">{message.length}/500</span>
        </label>

        {purchaseError ? (
          <p className="mt-4 rounded-lg bg-[#fff3f3] px-4 py-3 text-sm font-bold text-[#8c0504]">
            {purchaseError}
          </p>
        ) : null}

        <button className="mt-5 w-full rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-base font-black text-[#212121] shadow-[0_5px_0_#111] transition hover:bg-[#fff176]">
          Add {money(amountCents)} Gift Card to Cart
        </button>
        <p className="mt-3 text-center text-xs text-[#888]">
          The card is generated only after Stripe confirms payment.
        </p>
      </form>

      <div className="grid content-start gap-6">
        <section className="overflow-hidden rounded-2xl border-2 border-[#212121] bg-[#790606] shadow-[0_5px_0_#111]">
          <div className="relative min-h-[290px] p-7 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(237,38,49,0.8),transparent_48%),linear-gradient(135deg,rgba(0,0,0,0.15),rgba(0,0,0,0.5))]" />
            <div className="relative flex h-full min-h-[236px] flex-col justify-between">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#faff8d]">
                    Zelos Digital Gift Card
                  </p>
                  <p className="mt-3 font-bebas text-6xl leading-none">{money(amountCents)}</p>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/70 font-bebas text-4xl">
                  Z
                </div>
              </div>
              <div>
                <p className="font-bebas text-2xl uppercase">
                  {recipientName || "Someone Special"}
                </p>
                <p className="mt-1 line-clamp-2 max-w-sm text-sm leading-relaxed text-white/75">
                  {message || "A gift for learning, growth, and a stronger financial future."}
                </p>
                <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#faff8d]">
                  From {senderName || "You"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[#212121] bg-white p-5 shadow-[0_4px_0_#111]">
          <p className="eyebrow-red">Already Have One?</p>
          <h2 className="font-bebas text-3xl uppercase leading-none">Check Your Balance</h2>
          <form onSubmit={checkBalance} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              name="code"
              required
              maxLength={80}
              placeholder="ZELOS-XXXXXXXX"
              className={`${inputClass} uppercase tracking-widest`}
            />
            <button
              disabled={isCheckingBalance}
              className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black text-[#212121] shadow-[0_3px_0_#111] disabled:opacity-60"
            >
              {isCheckingBalance ? "Checking…" : "Check"}
            </button>
          </form>
          {balance ? (
            <div className="mt-4 rounded-xl bg-[#eef8e8] p-4">
              <p className="text-xs font-black uppercase tracking-wider text-[#24551f]">
                {balance.status}
              </p>
              <p className="mt-1 font-bebas text-4xl text-[#202020]">
                {money(balance.remainingAmountCents)}
              </p>
              <p className="text-xs text-[#667085]">
                remaining from {money(balance.initialAmountCents)}
              </p>
            </div>
          ) : null}
          {balanceMessage ? (
            <p className="mt-4 rounded-lg bg-[#fff3f3] px-4 py-3 text-sm font-bold text-[#8c0504]">
              {balanceMessage}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
