"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { type CartItem, loadCart, saveCart, cartSubtotalCents, money } from "@/lib/cart";

export function CartView({ imageMap }: { imageMap: Record<string, string> }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(cart);
  }, [cart, mounted]);

  const subtotal = cartSubtotalCents(cart);
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  function updateQty(index: number, qty: number) {
    if (qty <= 0) {
      setCart((c) => c.filter((_, i) => i !== index));
    } else {
      setCart((c) =>
        c.map((item, i) => (i === index ? { ...item, quantity: Math.min(99, qty) } : item)),
      );
    }
  }

  function remove(index: number) {
    setCart((c) => c.filter((_, i) => i !== index));
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
          <span className="font-semibold text-[#202020]">Cart</span>
        </nav>

        {/* Page title */}
        <div className="mb-8 flex items-end gap-4">
          <div>
            <p className="eyebrow-red">Shopping</p>
            <h1 className="font-bebas text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.86]">
              Your Cart
            </h1>
          </div>
          {mounted && itemCount > 0 && (
            <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#8c0504] font-bebas text-lg text-white">
              {itemCount}
            </span>
          )}
        </div>

        {!mounted ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#d8d2c5] border-t-[#8c0504]" />
          </div>
        ) : cart.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#d8d2c5] bg-white px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f1e9]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b22222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <p className="font-bebas text-3xl uppercase text-[#bbb]">Your cart is empty</p>
            <p className="mt-2 text-sm text-[#999]">Find something you love in the store.</p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Browse Store →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-4">
              {cart.map((item, index) => {
                const img = imageMap[item.productId];
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}-${index}`}
                    className="flex gap-4 rounded-2xl border-2 border-[#212121] bg-white p-4 shadow-[0_3px_0_#111]"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f4f1e9] sm:h-24 sm:w-24">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-bebas text-xs uppercase text-[#d8d2c5]">Zelos</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 min-w-0 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold leading-tight">{item.name}</p>
                          {(item.size || item.color) && (
                            <p className="mt-0.5 text-xs text-[#999]">
                              {[item.size, item.color].filter(Boolean).join(" / ")}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="shrink-0 text-xs font-black text-[#8c0504] transition hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateQty(index, item.quantity - 1)}
                            className="grid h-8 w-8 place-items-center rounded-md border-2 border-[#d8d2c5] bg-[#f9f6f1] font-black text-[#202020] transition hover:border-[#212121]"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(index, item.quantity + 1)}
                            className="grid h-8 w-8 place-items-center rounded-md border-2 border-[#d8d2c5] bg-[#f9f6f1] font-black text-[#202020] transition hover:border-[#212121]"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-black text-[#202020]">
                          {money(item.priceCents * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/store"
                className="block text-center text-sm font-medium text-[#8c0504]! underline underline-offset-2 hover:text-[#7a0505]! transition"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <aside className="space-y-4">
              <div className="rounded-2xl border-2 border-[#212121] bg-white p-6 shadow-[0_4px_0_#111]">
                <h2 className="font-bebas text-2xl uppercase">Order Summary</h2>

                <div className="mt-4 space-y-2.5">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-[#666]">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-[#999]"> ×{item.quantity}</span>
                        )}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {money(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[#e8e3da] pt-4">
                  <div className="flex items-center justify-between font-black">
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#aaa]">
                    Discounts &amp; gift cards applied at checkout
                  </p>
                </div>

                <Link
                  href="/store/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3.5 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176] active:shadow-[0_2px_0_#111]"
                >
                  Proceed to Checkout →
                </Link>
              </div>

              <div className="rounded-xl bg-[#8c0504] px-5 py-4">
                <p className="text-sm font-bold leading-relaxed text-white">
                  Every purchase supports the Zelos mission — financial literacy for the next
                  generation.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 px-1 text-xs text-[#999]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#14bd47]" />
                  Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2d93cf]" />
                  Ships in 5–7 days
                </span>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
