"use client";

import { useState } from "react";
import { type StoreProduct } from "@/components/StoreCart";

const CART_KEY = "zelos-store-cart";

type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  size?: string;
  color?: string;
};

function getActiveVariants(product: StoreProduct) {
  return (product.variants ?? []).filter((v) => v.isActive !== false);
}

function getSelectedVariant(product: StoreProduct, size: string, color: string) {
  return getActiveVariants(product).find(
    (v) => (v.size ?? "") === size && (v.color ?? "") === color,
  );
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function ProductAddToCart({ product }: { product: StoreProduct }) {
  const activeVariants = getActiveVariants(product);
  const sizes = activeVariants.length
    ? uniqueOptions(activeVariants.map((v) => v.size))
    : product.sizes;
  const colors = activeVariants.length
    ? uniqueOptions(activeVariants.map((v) => v.color))
    : product.colors;

  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = getSelectedVariant(product, selectedSize, selectedColor);
  const visibleInventory = activeVariants.length
    ? activeVariants.reduce((total, v) => total + v.inventoryCount, 0)
    : product.inventoryCount;
  const isOutOfStock = !product.isGiftCard && visibleInventory <= 0;
  const adjustedPrice = product.priceCents + (selectedVariant?.priceAdjustmentCents ?? 0);

  function addToCart() {
    const cart = loadCart();
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor,
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = Math.min(99, cart[existingIndex].quantity + quantity);
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        priceCents: adjustedPrice,
        quantity,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      });
    }

    saveCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  }

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-[#202020]">
            Color: <span className="font-normal text-[#555]">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`rounded-md border-2 px-4 py-2 text-sm font-bold transition ${
                  selectedColor === color
                    ? "border-[#212121] bg-[#212121] text-white"
                    : "border-[#d8d2c5] bg-white text-[#202020] hover:border-[#212121]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-[#202020]">
            Size: <span className="font-normal text-[#555]">{selectedSize}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-10 min-w-[48px] rounded-md border-2 px-3 text-sm font-bold transition ${
                  selectedSize === size
                    ? "border-[#212121] bg-[#212121] text-white"
                    : "border-[#d8d2c5] bg-white text-[#202020] hover:border-[#212121]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-bold text-[#202020]">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid h-10 w-10 place-items-center rounded-md border-2 border-[#d8d2c5] bg-white text-lg font-black text-[#202020] transition hover:border-[#212121]"
          >
            −
          </button>
          <span className="w-10 text-center text-lg font-bold text-[#202020]">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="grid h-10 w-10 place-items-center rounded-md border-2 border-[#d8d2c5] bg-white text-lg font-black text-[#202020] transition hover:border-[#212121]"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={addToCart}
          className="w-full rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-sm font-black text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176] active:shadow-[0_2px_0_#111] disabled:opacity-50"
        >
          {isOutOfStock ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart"}
        </button>
        <a
          href="/store"
          className="block text-center text-sm font-medium !text-[#8c0504] underline underline-offset-2 hover:!text-[#7a0505]"
        >
          View Full Store &amp; Checkout →
        </a>
      </div>

      {added && (
        <p className="rounded-md bg-[#eef8e8] px-4 py-3 text-sm font-bold text-[#24551f]">
          Added to your cart! Head to the store to checkout.
        </p>
      )}
    </div>
  );
}
