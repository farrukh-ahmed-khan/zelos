"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { loadStripe, type StripeCheckoutContact } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CART_KEY, type CartItem, saveCart, cartSubtotalCents, money } from "@/lib/cart";
import { api, isApiSuccess } from "@/lib/api/client";

type CheckoutContact = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type PaymentSession = {
  clientSecret: string;
  orderId: string;
  totalCents: number;
  firstName: string;
  lastName: string;
  shippingAddress: Address;
  billingAddress: Address;
};

declare global {
  var zelosStripePromise:
    | {
        publishableKey: string;
        promise: ReturnType<typeof loadStripe>;
      }
    | undefined;
}

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

function getStripePromise() {
  if (!stripePublishableKey) return null;

  if (globalThis.zelosStripePromise?.publishableKey === stripePublishableKey) {
    return globalThis.zelosStripePromise.promise;
  }

  const promise = loadStripe(stripePublishableKey);
  globalThis.zelosStripePromise = { publishableKey: stripePublishableKey, promise };
  return promise;
}

const stripePromise = getStripePromise();

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
        <select name={`${prefix}_country`} defaultValue="US" className={inputClass}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="PK">Pakistan</option>
        </select>
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
    country: String(formData.get(`${prefix}_country`) ?? "US") || "US",
  };
}

function stripeContact(name: string, address: Address): StripeCheckoutContact {
  return {
    name,
    address: {
      line1: address.line1,
      line2: address.line2 ?? null,
      city: address.city,
      state: address.state,
      postal_code: address.zip,
      country: address.country,
    },
  };
}

function PaymentForm({ session }: { session: PaymentSession }) {
  const checkoutState = useCheckoutElements();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (checkoutState.type !== "success") return;

    setPaymentError("");
    setIsPaying(true);

    try {
      const fullName = `${session.firstName} ${session.lastName}`.trim();
      const result = await checkoutState.checkout.confirm({
        redirect: "if_required",
        shippingAddress: stripeContact(fullName, session.shippingAddress),
        billingAddress: stripeContact(fullName, session.billingAddress),
      });

      if (result.type === "error") {
        setPaymentError(result.error.message || "Payment could not be completed.");
        return;
      }

      saveCart([]);
      window.location.assign(`/store?checkout=success&orderId=${session.orderId}`);
    } catch (error) {
      setPaymentError(
        error instanceof Error && error.message
          ? error.message
          : "Payment could not be completed. Please try again.",
      );
    } finally {
      setIsPaying(false);
    }
  }

  if (checkoutState.type === "loading") {
    return (
      <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
        <div className="h-5 w-40 animate-pulse rounded bg-[#e8e3da]" />
        <div className="mt-5 h-28 animate-pulse rounded-xl bg-[#f4f1e9]" />
      </div>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <div className="rounded-xl border border-[#f4c5c5] bg-[#fff3f3] px-5 py-4 text-sm font-bold text-[#8c0504]">
        {checkoutState.error.message}
      </div>
    );
  }

  return (
    <form
      onSubmit={handlePayment}
      className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]"
    >
      <h2 className="mb-2 font-bebas text-2xl uppercase">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8c0504] text-sm text-white">
          4
        </span>
        Secure Payment
      </h2>
      <p className="mb-5 text-sm leading-relaxed text-[#777]">
        Complete payment here without leaving the Zelos checkout.
      </p>

      <PaymentElement
        options={{
          layout: "accordion",
          fields: { billingDetails: "never" },
        }}
      />

      {paymentError ? (
        <p className="mt-4 rounded-lg bg-[#fff3f3] px-4 py-3 text-sm font-bold text-[#8c0504]">
          {paymentError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPaying || !checkoutState.checkout.canConfirm}
        className="mt-5 w-full rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-base font-black text-[#212121]! shadow-[0_5px_0_#111] transition hover:bg-[#fff176] active:shadow-[0_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPaying ? "Processing Payment…" : `Pay ${money(session.totalCents)}`}
      </button>
      <p className="mt-3 text-center text-xs text-[#999]">
        Card details are encrypted and sent directly to Stripe.
      </p>
    </form>
  );
}

function PaymentStep({ session }: { session: PaymentSession }) {
  const options = useMemo(
    () => ({
      clientSecret: session.clientSecret,
      defaultValues: {
        shippingAddress: stripeContact(
          `${session.firstName} ${session.lastName}`.trim(),
          session.shippingAddress,
        ),
        billingAddress: stripeContact(
          `${session.firstName} ${session.lastName}`.trim(),
          session.billingAddress,
        ),
      },
      elementsOptions: {
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#8c0504",
            colorText: "#202020",
            colorBackground: "#faf8f4",
            colorDanger: "#8c0504",
            borderRadius: "8px",
            fontFamily: "Arial, sans-serif",
          },
        },
      },
    }),
    [session],
  );

  return (
    <CheckoutElementsProvider
      key={session.clientSecret}
      stripe={stripePromise}
      options={options}
    >
      <PaymentForm session={session} />
    </CheckoutElementsProvider>
  );
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
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);

  const subtotal = cartSubtotalCents(cart);
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!stripePublishableKey) {
      setError("Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const shippingAddress = extractAddress(formData, "shipping");
      const billingAddress = billingSameAsShipping
        ? shippingAddress
        : extractAddress(formData, "billing");
      const firstName = String(formData.get("firstName") ?? "");
      const lastName = String(formData.get("lastName") ?? "");
      const email = String(formData.get("email") ?? "");

      const response = await api.post("/api/checkout", {
        firstName,
        lastName,
        email,
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

      if (result.data.paid) {
        saveCart([]);
        window.location.assign(`/store?checkout=success&orderId=${result.data.orderId}`);
        return;
      }

      if (!result.data.clientSecret) {
        setError("Payment could not be initialized. Please try again.");
        return;
      }

      setPaymentSession({
        clientSecret: result.data.clientSecret,
        orderId: result.data.orderId,
        totalCents: result.data.totalCents,
        firstName,
        lastName,
        shippingAddress,
        billingAddress,
      });
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
                <fieldset disabled={Boolean(paymentSession)} className="space-y-5 disabled:opacity-70">

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

                  {/* Submit contact and delivery details before mounting secure payment fields. */}
                  {paymentSession ? (
                    <p className="rounded-xl bg-[#eef8e8] px-5 py-4 text-sm font-bold text-[#24551f]">
                      Your details are saved. Complete the secure payment below.
                    </p>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-base font-black text-[#212121]! shadow-[0_5px_0_#111] transition hover:bg-[#fff176] active:shadow-[0_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? "Preparing Payment…" : `Continue to Payment · ${money(subtotal)}`}
                      </button>
                      <p className="text-center text-xs text-[#aaa]">
                        Payment is completed securely on this Zelos page.
                      </p>
                    </>
                  )}
                </fieldset>
              </form>

              {paymentSession ? <PaymentStep session={paymentSession} /> : null}
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
