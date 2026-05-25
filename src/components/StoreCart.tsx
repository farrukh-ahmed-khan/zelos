"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, isApiSuccess } from "@/lib/api/client";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  sizes: string[];
  colors: string[];
  inventoryCount: number;
  limitedEdition: boolean;
  isActive: boolean;
  isGiftCard: boolean;
};

type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  size?: string;
  color?: string;
  giftCardAmountCents?: number;
};

const CART_KEY = "zelos-store-cart";
const GIFT_CARD_AMOUNTS = [25, 50, 100];

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function loadCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function StoreCart({
  products,
  featuredProduct,
}: {
  products: StoreProduct[];
  featuredProduct?: StoreProduct;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCart(loadCart());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const visibleProducts = featuredProduct ? [featuredProduct] : products;
  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  function addToCart(product: StoreProduct, formData?: FormData) {
    const size = String(formData?.get("size") ?? product.sizes[0] ?? "");
    const color = String(formData?.get("color") ?? product.colors[0] ?? "");
    const quantity = Number(formData?.get("quantity") ?? 1);

    setCart((current) => {
      const existingIndex = current.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color,
      );

      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
            : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          quantity,
          size,
          color,
        },
      ];
    });
    setMessage(`${product.name} added to cart.`);
  }

  function addGiftCard(amountDollars: number) {
    const amountCents = Math.round(amountDollars * 100);

    if (amountCents < 100) {
      setMessage("Gift card amount must be at least $1.");
      return;
    }

    setCart((current) => [
      ...current,
      {
        productId: "__gift_card__",
        name: "Zelos Gift Card",
        priceCents: amountCents,
        quantity: 1,
        giftCardAmountCents: amountCents,
      },
    ]);
    setMessage(`${money(amountCents)} gift card added to cart.`);
  }

  function updateQuantity(index: number, quantity: number) {
    setCart((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(index: number) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!cart.length) {
      setMessage("Add at least one item to your cart first.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await api.post("/api/checkout", {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        giftCardCode: String(formData.get("giftCardCode") ?? ""),
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
        setMessage(result?.error?.message ?? "Checkout failed.");
        return;
      }

      setCart([]);

      if (result.data.checkoutUrl) {
        window.location.assign(result.data.checkoutUrl);
        return;
      }

      setMessage(result.data.message ?? "Order completed.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  function productForm(product: StoreProduct) {
    return (
      <form
        key={product.id}
        onSubmit={(event) => {
          event.preventDefault();
          addToCart(product, new FormData(event.currentTarget));
        }}
        className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]"
      >
        {product.images[0] ? (
          <img src={product.images[0]} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
        ) : (
          <div className="aspect-[4/3] rounded-md bg-[#f4f1e9]" />
        )}
        <p className="text-xs font-black uppercase text-[#b22222]">
          {product.isGiftCard ? "Gift Card" : product.limitedEdition ? "Limited Edition" : "Zelos Gear"}
        </p>
        <h2 className="font-bebas text-3xl uppercase leading-none">{product.name}</h2>
        <p className="text-sm leading-relaxed text-[#555]">{product.description}</p>
        <p className="font-black">{money(product.priceCents)}</p>
        {product.sizes.length ? (
          <select name="size" className="rounded-md border border-[#d8d2c5] px-3 py-3">
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        ) : null}
        {product.colors.length ? (
          <select name="color" className="rounded-md border border-[#d8d2c5] px-3 py-3">
            {product.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        ) : null}
        <input
          name="quantity"
          type="number"
          min={1}
          max={product.inventoryCount || 99}
          defaultValue={1}
          className="rounded-md border border-[#d8d2c5] px-3 py-3"
        />
        <button
          disabled={!product.isGiftCard && product.inventoryCount <= 0}
          className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:opacity-50"
        >
          {product.inventoryCount <= 0 && !product.isGiftCard ? "Out of Stock" : "Add to Cart"}
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <section className="mb-4 rounded-md border-2 border-[#212121] bg-[#faff8d] p-4 shadow-[0_4px_0_#111]">
          <p className="text-xs font-black uppercase text-[#b22222]">Digital Delivery</p>
          <h2 className="font-bebas text-3xl uppercase leading-none">Gift Cards</h2>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              addGiftCard(Number(formData.get("customAmount") ?? 25));
              event.currentTarget.reset();
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {GIFT_CARD_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addGiftCard(amount)}
                  className="rounded-md border-2 border-[#212121] bg-white px-3 py-3 text-sm font-black shadow-[0_3px_0_#111]"
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                name="customAmount"
                type="number"
                min={1}
                max={1000}
                step={1}
                placeholder="Custom"
                className="min-w-0 rounded-md border border-[#d8d2c5] px-3 py-3"
              />
              <button className="rounded-md border-2 border-[#212121] bg-white px-4 py-3 text-sm font-black shadow-[0_3px_0_#111]">
                Add
              </button>
            </div>
          </form>
        </section>
        <div className={featuredProduct ? "grid gap-4" : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"}>
          {visibleProducts.map(productForm)}
        </div>
      </section>

      <aside className="grid content-start gap-4">
        {message ? (
          <p className="rounded-md bg-[#fff8d9] px-4 py-3 text-sm font-bold text-[#8c0504]">
            {message}
          </p>
        ) : null}
        <section className="rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
          <h2 className="font-bebas text-3xl uppercase leading-none">Cart</h2>
          <div className="mt-4 grid gap-3">
            {cart.length ? (
              cart.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="rounded-md bg-[#f8f3e8] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-[#666]">
                        {[item.size, item.color].filter(Boolean).join(" / ") || "Standard"}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="text-xs font-black text-[#8c0504]">
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(index, Number(event.target.value))}
                      className="w-20 rounded-md border border-[#d8d2c5] px-2 py-2"
                    />
                    <p className="font-black">{money(item.priceCents * item.quantity)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#555]">Your cart is empty.</p>
            )}
          </div>
          <div className="mt-4 border-t border-[#e4ded1] pt-4">
            <p className="flex justify-between font-black">
              <span>Subtotal</span>
              <span>{money(subtotalCents)}</span>
            </p>
          </div>
        </section>

        <form onSubmit={checkout} className="grid gap-3 rounded-md border-2 border-[#212121] bg-white p-4 shadow-[0_4px_0_#111]">
          <h2 className="font-bebas text-3xl uppercase leading-none">Checkout</h2>
          <input name="firstName" required placeholder="First name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <input name="lastName" required placeholder="Last name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <input name="email" required type="email" placeholder="Email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
          <input name="giftCardCode" placeholder="Gift card code" className="rounded-md border border-[#d8d2c5] px-3 py-3 uppercase" />
          <button
            disabled={isCheckingOut || !cart.length}
            className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-3 text-sm font-black !text-[#212121] shadow-[0_4px_0_#111] disabled:opacity-50"
          >
            {isCheckingOut ? "Opening Checkout..." : "Checkout"}
          </button>
        </form>
      </aside>
    </div>
  );
}
