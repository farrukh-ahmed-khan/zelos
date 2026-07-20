"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CART_KEY, type CartItem, money } from "@/lib/cart";
import { type StoreProduct } from "@/components/StoreCart";

type ProductVariant = NonNullable<StoreProduct["variants"]>[number];

function activeVariants(product: StoreProduct) {
  return (product.variants ?? []).filter((variant) => variant.isActive !== false);
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function selectedVariant(product: StoreProduct, size: string, color: string) {
  return activeVariants(product).find(
    (variant) => (variant.size ?? "") === size && (variant.color ?? "") === color,
  );
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanDescription(description: string) {
  return decodeHtml(description)
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function loadCart(): CartItem[] {
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

function swatchStyle(color: string) {
  const colorMap: Record<string, string> = {
    black: "#111111",
    white: "#ffffff",
    red: "#b22222",
    navy: "#1f2a44",
    blue: "#2563eb",
    gray: "#9ca3af",
    grey: "#9ca3af",
    ash: "#d7d2c8",
    natural: "#e9dfc8",
    pink: "#f4a9c9",
    green: "#2f855a",
  };
  const key = color.toLowerCase().split(/[ /-]/)[0];

  return { backgroundColor: colorMap[key] ?? "#d8d2c5" };
}

function galleryImages(product: StoreProduct, variant: ProductVariant | undefined) {
  const selectedImage = variant?.imageUrl;
  const images = [
    selectedImage,
    ...(activeVariants(product).map((entry) => entry.imageUrl).filter(Boolean) as string[]),
    ...product.images,
  ].filter((image): image is string => Boolean(image));

  return Array.from(new Set(images));
}

export function ProductDetailView({
  product,
  related,
}: {
  product: StoreProduct;
  related: StoreProduct[];
}) {
  const variants = activeVariants(product);
  const sizes = variants.length ? uniqueOptions(variants.map((variant) => variant.size)) : product.sizes;
  const colors = variants.length ? uniqueOptions(variants.map((variant) => variant.color)) : product.colors;
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const variant = selectedVariant(product, selectedSize, selectedColor);
  const images = galleryImages(product, variant);
  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const mainImage = variant?.imageUrl ?? selectedImage ?? images[0] ?? "";
  const adjustedPrice = product.priceCents + (variant?.priceAdjustmentCents ?? 0);
  const description = useMemo(() => cleanDescription(product.description), [product.description]);
  const paragraphs = description.split(/\n{2,}/).filter(Boolean).slice(0, 5);
  const visibleInventory = variants.length
    ? variants.reduce((total, entry) => total + entry.inventoryCount, 0)
    : product.inventoryCount;
  const isOutOfStock = !product.isGiftCard && visibleInventory <= 0;

  function chooseColor(color: string) {
    setSelectedColor(color);
    const nextVariant = variants.find(
      (entry) => (entry.color ?? "") === color && (!selectedSize || (entry.size ?? "") === selectedSize),
    );

    if (nextVariant?.size) {
      setSelectedSize(nextVariant.size);
    }

    if (nextVariant?.imageUrl) {
      setSelectedImage(nextVariant.imageUrl);
    }
  }

  function chooseSize(size: string) {
    setSelectedSize(size);
    const nextVariant = variants.find(
      (entry) => (entry.size ?? "") === size && (!selectedColor || (entry.color ?? "") === selectedColor),
    );

    if (nextVariant?.color) {
      setSelectedColor(nextVariant.color);
    }

    if (nextVariant?.imageUrl) {
      setSelectedImage(nextVariant.imageUrl);
    }
  }

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
    window.setTimeout(() => setAdded(false), 3000);
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)] lg:gap-14">
        <section className="min-w-0">
          <div className="sticky top-24 grid gap-4">
            <div className="overflow-hidden rounded-md border border-[#ded6c8] bg-white shadow-[0_5px_0_rgba(0,0,0,0.08)]">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={product.name} className="aspect-square w-full object-contain p-6" />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-[#f4f1e9]">
                  <div className="font-bebas text-[5rem] uppercase leading-none text-[#d8d2c5]">Zelos</div>
                  <p className="text-sm text-[#999]">No image yet</p>
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.slice(0, 12).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square overflow-hidden rounded-md border bg-white transition ${
                      image === mainImage
                        ? "border-[#8c0504] shadow-[0_3px_0_#8c0504]"
                        : "border-[#ded6c8] hover:border-[#212121]"
                    }`}
                    aria-label={`${product.name} image ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="h-full w-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-[#ded6c8] bg-[#f9f6ee] p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-[#8c0504] px-2 py-1 text-[11px] font-black uppercase text-white">
              {product.isGiftCard ? "Gift Card" : product.limitedEdition ? "Limited" : "Zelos Store"}
            </span>
            {product.printify?.enabled ? (
              <span className="rounded-sm border border-[#d8d2c5] bg-white px-2 py-1 text-[11px] font-black uppercase text-[#555]">
                Print on demand
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86] text-[#1e1e1e]">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-y border-[#ded6c8] py-4">
            <p className="font-bebas text-[2.5rem] leading-none text-[#1e1e1e]">{money(adjustedPrice)}</p>
            {variant?.sku ? <span className="text-xs font-bold uppercase text-[#777]">SKU {variant.sku}</span> : null}
          </div>

          {paragraphs.length ? (
            <div className="mt-5 grid gap-3 text-[15px] leading-7 text-[#555]">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          <div className="mt-7 grid gap-5 border-t border-[#ded6c8] pt-6">
            {colors.length ? (
              <div>
                <p className="mb-2 text-sm font-black text-[#202020]">
                  Color <span className="font-semibold text-[#777]">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => chooseColor(color)}
                      className={`flex h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
                        selectedColor === color
                          ? "border-[#212121] bg-white shadow-[0_3px_0_#111]"
                          : "border-[#d8d2c5] bg-white/70 hover:border-[#212121]"
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full border border-[#cfc7b8]" style={swatchStyle(color)} />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {sizes.length ? (
              <div>
                <p className="mb-2 text-sm font-black text-[#202020]">
                  Size <span className="font-semibold text-[#777]">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => chooseSize(size)}
                      className={`h-11 min-w-[52px] rounded-md border px-3 text-sm font-black transition ${
                        selectedSize === size
                          ? "border-[#212121] bg-[#212121] text-white shadow-[0_3px_0_#8c0504]"
                          : "border-[#d8d2c5] bg-white hover:border-[#212121]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-sm font-black text-[#202020]">Quantity</p>
              <div className="inline-grid grid-cols-[44px_54px_44px] overflow-hidden rounded-md border border-[#d8d2c5] bg-white">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="text-lg font-black">
                  -
                </button>
                <span className="grid h-11 place-items-center border-x border-[#d8d2c5] text-sm font-black">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="text-lg font-black">
                  +
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={addToCart}
                className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-4 text-sm font-black text-[#212121] shadow-[0_4px_0_#111] transition hover:bg-[#fff176] active:translate-y-0.5 active:shadow-[0_2px_0_#111] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isOutOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
              </button>
              {added ? (
                <Link
                  href="/store/cart"
                  className="flex items-center justify-center rounded-md border-2 border-[#212121] bg-white px-6 py-3 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111] transition hover:bg-[#f9f6f1]"
                >
                  View Cart
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-md bg-[#8c0504] px-5 py-4">
            <p className="text-sm font-bold text-white">
              Every purchase supports the Zelos mission, helping young people build stronger financial futures.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#777]">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#14bd47]" />
              Secure checkout
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2d93cf]" />
              Ships within 5-7 days
            </span>
          </div>
        </section>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 pb-8">
          <p className="eyebrow-red mb-1">Also Available</p>
          <h2 className="home-section-heading mb-8 bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            More From The Store
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((relProd) => (
              <Link
                href={`/store/${relProd.slug}`}
                key={relProd.id}
                className="block overflow-hidden rounded-md border border-[#ded6c8] bg-white p-3 shadow-[0_4px_0_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
              >
                <div className="overflow-hidden rounded-md bg-[#f4f1e9]">
                  {relProd.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={relProd.images[0]} alt={relProd.name} className="aspect-square w-full object-contain p-3" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center">
                      <span className="font-bebas text-3xl uppercase text-[#d8d2c5]">Zelos</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="mb-1 text-xs font-bold uppercase text-[#b22222]">
                    {relProd.limitedEdition ? "Limited Edition" : "Zelos Gear"}
                  </p>
                  <h3 className="font-bebas text-[1.6rem] uppercase leading-none text-[#202020]">{relProd.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-bebas text-[1.3rem] text-[#202020]">{money(relProd.priceCents)}</p>
                    <span className="text-sm font-bold text-[#b22222]">Shop Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
