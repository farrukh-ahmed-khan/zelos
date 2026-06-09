"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CART_KEY, type CartItem, saveCart, cartSubtotalCents, money } from "@/lib/cart";
import { api, isApiSuccess } from "@/lib/api/client";

type CheckoutContact = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

const EMPTY_CART: CartItem[] = [];
let cachedCartRaw = "";
let cachedCart: CartItem[] = EMPTY_CART;

function getCartSnapshot() {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(CART_KEY) ?? "[]";
    if (raw === cachedCartRaw) return cachedCart;
    const parsed = JSON.parse(raw);
    cachedCartRaw = raw;
    cachedCart = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY_CART;
    return cachedCart;
  } catch {
    cachedCartRaw = "";
    cachedCart = EMPTY_CART;
    return cachedCart;
  }
}

function subscribeToCartChanges(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}

const inputClass =
  "w-full rounded-md border-2 border-[#d8d2c5] bg-[#faf8f4] px-4 py-3 text-sm transition focus:border-[#8c0504] focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wider text-[#555]";

function AddressFields({ prefix }: { prefix: string }) {
  return (
    <div className="grid gap-4">
      <div>
        <label className={labelClass}>Address Line 1 *</label>
        <input name={`${prefix}_line1`} required placeholder="123 Main Street" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Address Line 2</label>
        <input name={`${prefix}_line2`} placeholder="Apt, Suite, Unit (optional)" className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className={labelClass}>City *</label>
          <input name={`${prefix}_city`} required placeholder="New York" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>State *</label>
          <input name={`${prefix}_state`} required placeholder="NY" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>ZIP Code *</label>
          <input name={`${prefix}_zip`} required placeholder="10001" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Country</label>
        <input name={`${prefix}_country`} placeholder="United States" defaultValue="United States" className={inputClass} />
      </div>
    </div>
  );
}

function extractAddress(formData: FormData, prefix: string) {
  return {
    line1: String(formData.get(`${prefix}_line1`) ?? ""),
    line2: String(formData.get(`${prefix}_line2`) ?? "") || undefined,
    city: String(formData.get(`${prefix}_city`) ?? ""),
    state: String(formData.get(`${prefix}_state`) ?? ""),
    zip: String(formData.get(`${prefix}_zip`) ?? ""),
    country: String(formData.get(`${prefix}_country`) ?? "United States") || "United States",
  };
}

export function CheckoutView({
  contact,
  imageMap,
}: {
  contact?: CheckoutContact;
  imageMap: Record<string, string>;
}) {
  const cart = useSyncExternalStore(subscribeToCartChanges, getCartSnapshot, () => EMPTY_CART);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [giftCodeOpen, setGiftCodeOpen] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  const subtotal = cartSubtotalCents(cart);
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const shippingAddress = extractAddress(formData, "shipping");
      const billingAddress = billingSameAsShipping
        ? shippingAddress
        : extractAddress(formData, "billing");

      const response = await api.post("/api/checkout", {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        giftCardCode: String(formData.get("giftCardCode") ?? "") || undefined,
        shippingAddress,
        billingAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          giftCardAmountCents: item.giftCardAmountCents,
        })),
      });

      const result = response.data;

      if (!isApiSuccess(response.status)) {
        setError(result?.error?.message ?? "Checkout failed. Please try again.");
        return;
      }

      saveCart([]);

      if (result.data.checkoutUrl) {
        window.location.assign(result.data.checkoutUrl);
        return;
      }

      window.location.assign("/store?checkout=success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      {/* Branded red header */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-20 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 py-5 text-sm text-[#888]">
          <Link href="/" className="transition hover:text-[#b22222]">Home</Link>
          <span>/</span>
          <Link href="/store" className="transition hover:text-[#b22222]">Store</Link>
          <span>/</span>
          <Link href="/store/cart" className="transition hover:text-[#b22222]">Cart</Link>
          <span>/</span>
          <span className="font-semibold text-[#202020]">Checkout</span>
        </nav>

        <div className="mb-8">
          <p className="eyebrow-red">Almost There</p>
          <h1 className="font-bebas text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.86]">
            Checkout
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#d8d2c5] bg-white px-8 py-20 text-center">
            <p className="font-bebas text-3xl uppercase text-[#bbb]">Your cart is empty</p>
            <p className="mt-2 text-sm text-[#999]">Add some items before checking out.</p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Browse Store →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: form */}
            <div className="space-y-5">
              {error && (
                <div className="rounded-xl border border-[#f4c5c5] bg-[#fff3f3] px-5 py-4 text-sm font-bold text-[#8c0504]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* 1 — Contact */}
                <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                  <h2 className="mb-5 font-bebas text-2xl uppercase">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c0504] text-sm text-white">1</span>
                    Contact Information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input name="firstName" required placeholder="Jordan" defaultValue={contact?.firstName ?? ""} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input name="lastName" required placeholder="Smith" defaultValue={contact?.lastName ?? ""} className={inputClass} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass}>Email Address *</label>
                    <input name="email" type="email" required placeholder="you@example.com" defaultValue={contact?.email ?? ""} className={inputClass} />
                    <p className="mt-1.5 text-xs text-[#aaa]">Order confirmation &amp; tracking updates sent here.</p>
                  </div>
                </div>

                {/* 2 — Shipping address */}
                <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                  <h2 className="mb-5 font-bebas text-2xl uppercase">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c0504] text-sm text-white">2</span>
                    Shipping Address
                  </h2>
                  <AddressFields prefix="shipping" />
                </div>

                {/* 3 — Billing address */}
                <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                  <h2 className="mb-4 font-bebas text-2xl uppercase">
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c0504] text-sm text-white">3</span>
                    Billing Address
                  </h2>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="h-4 w-4 rounded border-[#d8d2c5] accent-[#8c0504]"
                    />
                    <span className="text-sm font-bold text-[#555]">Same as shipping address</span>
                  </label>
                  {!billingSameAsShipping && (
                    <div className="mt-4">
                      <AddressFields prefix="billing" />
                    </div>
                  )}
                </div>

                {/* 4 — Gift card */}
                <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                  <button
                    type="button"
                    onClick={() => setGiftCodeOpen((o) => !o)}
                    className="flex w-full items-center justify-between font-bebas text-xl uppercase text-[#202020] transition hover:text-[#8c0504]"
                  >
                    <span>Have a Gift Card Code?</span>
                    <span className="text-base">{giftCodeOpen ? "−" : "+"}</span>
                  </button>
                  {giftCodeOpen && (
                    <div className="mt-4">
                      <input
                        name="giftCardCode"
                        placeholder="e.g. ZELOS-A1B2C3D4"
                        className={`${inputClass} uppercase tracking-widest`}
                      />
                      <p className="mt-1.5 text-xs text-[#aaa]">Discount applied automatically at checkout.</p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-base font-black text-[#212121]! shadow-[0_5px_0_#111] transition hover:bg-[#fff176] active:shadow-[0_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Opening Secure Checkout…" : `Place Order · ${money(subtotal)}`}
                </button>

                <p className="text-center text-xs text-[#aaa]">
                  You&apos;ll be redirected to Stripe for secure payment. SSL encrypted.
                </p>
              </form>
            </div>

            {/* Right: order review */}
            <aside className="space-y-4">
              <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bebas text-2xl uppercase">Order Review</h2>
                  <span className="text-sm font-bold text-[#888]">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-3">
                  {cart.map((item, index) => {
                    const img = imageMap[item.productId];
                    return (
                      <div key={index} className="flex items-center gap-3 rounded-xl bg-[#f9f6f1] p-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#eee6d6]">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="font-bebas text-[9px] uppercase text-[#d8d2c5]">Zelos</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold">{item.name}</p>
                          <p className="text-xs text-[#999]">
                            {[item.size, item.color].filter(Boolean).join(" / ") || "Standard"} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-black">{money(item.priceCents * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-[#e8e3da] pt-4">
                  <div className="flex items-center justify-between font-black">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#aaa]">Discounts &amp; taxes confirmed at payment</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#8c0504] px-5 py-4">
                <p className="text-sm font-bold leading-relaxed text-white">
                  Your purchase supports financial literacy programs for young people.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 px-1 text-xs text-[#999]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#14bd47]" />
                  SSL encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2d93cf]" />
                  Powered by Stripe
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f5a623]" />
                  Ships in 5–7 days
                </span>
              </div>

              <Link
                href="/store/cart"
                className="block text-center text-sm font-medium text-[#8c0504]! underline underline-offset-2 hover:text-[#7a0505]! transition"
              >
                ← Edit Cart
              </Link>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
