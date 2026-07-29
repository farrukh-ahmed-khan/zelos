"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRef } from "react";
import { type StoreProduct } from "@/components/StoreCart";

type SlimProduct = Pick<
  StoreProduct,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "priceCents"
  | "images"
  | "colors"
  | "variants"
  | "limitedEdition"
>;

const FALLBACK_PRODUCTS: SlimProduct[] = [
  {
    id: "fallback-1",
    name: "Zelos Hat",
    slug: "",
    description: "A classic Zelos cap for everyday wear.",
    priceCents: 2800,
    images: ["/assets/swag-cap.png"],
    colors: ["Zelos Red"],
    limitedEdition: true,
  },
  {
    id: "fallback-2",
    name: "Zelos Shirt",
    slug: "",
    description: "A comfortable Zelos shirt with a bold signature design.",
    priceCents: 2200,
    images: ["/assets/swag-tee.png"],
    colors: ["White", "Black", "Red"],
    limitedEdition: false,
  },
  {
    id: "fallback-3",
    name: "Zelos Hoodie",
    slug: "",
    description: "A soft Zelos hoodie made for comfortable layering.",
    priceCents: 4500,
    images: ["/assets/swag-hoodie.png"],
    colors: ["Navy", "Teal", "Black"],
    limitedEdition: false,
  },
];

function toPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getAvailableColors(product: SlimProduct) {
  const activeVariantColors = (product.variants ?? [])
    .filter(
      (variant) =>
        variant.isActive !== false &&
        variant.inventoryCount > 0 &&
        Boolean(variant.color),
    )
    .map((variant) => variant.color as string);

  return Array.from(
    new Set(activeVariantColors.length > 0 ? activeVariantColors : product.colors),
  );
}

function getSwatchColor(color: string) {
  const normalized = color.toLowerCase();

  if (normalized.includes("black")) return "#171717";
  if (normalized.includes("white")) return "#ffffff";
  if (normalized.includes("red")) return "#b22222";
  if (normalized.includes("navy")) return "#202b46";
  if (normalized.includes("teal")) return "#168c8c";
  if (normalized.includes("cream")) return "#eadfc8";
  if (normalized.includes("gray") || normalized.includes("grey")) return "#8b8b8b";
  if (normalized.includes("blue")) return "#315f9b";
  if (normalized.includes("green")) return "#3d7d4a";

  return "#d8d2c5";
}

export function SwagStoreHighlight({ products }: { products?: SlimProduct[] }) {
  const display = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const sliderRef = useRef<HTMLDivElement>(null);

  function scrollProducts(direction: "left" | "right") {
    const slider = sliderRef.current;
    const firstSlide = slider?.firstElementChild;

    if (!slider || !(firstSlide instanceof HTMLElement)) {
      return;
    }

    const styles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    const step = firstSlide.offsetWidth + gap;
    const maxScroll = Math.max(slider.scrollWidth - slider.clientWidth, 0);

    if (maxScroll <= 1) {
      return;
    }

    const atStart = slider.scrollLeft <= 1;
    const atEnd = slider.scrollLeft >= maxScroll - 1;
    const nextPosition =
      direction === "left"
        ? atStart
          ? maxScroll
          : Math.max(0, slider.scrollLeft - step)
        : atEnd
          ? 0
          : Math.min(maxScroll, slider.scrollLeft + step);

    slider.scrollTo({ left: nextPosition, behavior: "smooth" });
  }

  return (
    <section
      id="swag-store-highlight"
      className="overflow-hidden bg-white px-4 py-16 text-[#202020] sm:px-6 lg:py-20"
    >
      <div className="container">
        <div className="mx-auto max-w-300">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow-red mb-1">Shop Now</p>
              <h2 className="home-section-heading bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                Swag Store Highlight
              </h2>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-black text-white transition hover:bg-[#b22222] focus-visible:bg-[#b22222] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b22222]"
                type="button"
                aria-label="Previous products"
                onClick={() => scrollProducts("left")}
              >
                <ArrowLeftOutlined />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-black text-white transition hover:bg-[#b22222] focus-visible:bg-[#b22222] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b22222]"
                type="button"
                aria-label="Next products"
                onClick={() => scrollProducts("right")}
              >
                <ArrowRightOutlined />
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 lg:gap-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {display.map((product) => {
              const availableColors = getAvailableColors(product);

              return (
                <article
                  key={product.id}
                  className="flex w-[88%] shrink-0 snap-start flex-col rounded-md bg-white p-4 transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.14)] focus-within:-translate-y-1 focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.14)] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-5rem)/3)]"
                >
                <div className="relative aspect-[0.91] overflow-hidden rounded-md bg-[#f1f1f1]">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-bebas text-2xl uppercase text-[#ccc]">
                      Zelos
                    </div>
                  )}
                  {product.limitedEdition && (
                    <span className="absolute left-3 top-3 rounded-sm bg-[#b22222] px-2 py-0.5 font-dm text-xs font-bold uppercase tracking-wide text-white">
                      Limited
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bebas text-[1.45rem] uppercase leading-none text-[#202020]">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-6 text-sm text-[#9b9b9b]">
                      {toPlainText(product.description)}
                    </p>
                  </div>
                  <p className="font-bebas text-[1.45rem] leading-none text-[#202020]">
                    ${(product.priceCents / 100).toFixed(0)}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#666]">
                    Available colors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#ded8cc] bg-white px-2.5 py-1 text-xs font-semibold text-[#444]"
                      >
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: getSwatchColor(color) }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {product.slug ? (
                  <Link
                    href={`/store/${product.slug}`}
                    className="mt-4 inline-flex font-bebas text-sm uppercase leading-none text-[#202020]! transition hover:text-[#b22222]!"
                  >
                    Shop Now →
                  </Link>
                ) : (
                  <Link
                    href="/store"
                    className="mt-4 inline-flex font-bebas text-sm uppercase leading-none text-[#202020]! transition hover:text-[#b22222]!"
                  >
                    View Store →
                  </Link>
                )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/store"
              className="inline-flex rounded-md border-2 border-[#212121] bg-[#faff8d] px-7 py-2.5 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Visit the Full Store
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
