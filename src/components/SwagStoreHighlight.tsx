"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type StoreProduct } from "@/components/StoreCart";

type SlimProduct = Pick<
  StoreProduct,
  "id" | "name" | "slug" | "description" | "priceCents" | "images" | "limitedEdition"
>;

const FALLBACK_PRODUCTS: SlimProduct[] = [
  {
    id: "fallback-1",
    name: "Zelos Signature Hoodie",
    slug: "",
    description: "Available in Navy, Teal, and Black",
    priceCents: 4500,
    images: ["/assets/swag-hoodie.png"],
    limitedEdition: false,
  },
  {
    id: "fallback-2",
    name: "Money Minds Tee (Youth)",
    slug: "",
    description: "Sizes S–XL · Youth Cut",
    priceCents: 2200,
    images: ["/assets/swag-tee.png"],
    limitedEdition: false,
  },
  {
    id: "fallback-3",
    name: "Zelos Cap — Limited Edition",
    slug: "",
    description: "Limited Run · While Stocks Last",
    priceCents: 2800,
    images: ["/assets/swag-cap.png"],
    limitedEdition: true,
  },
];

export function SwagStoreHighlight({ products }: { products?: SlimProduct[] }) {
  const display = products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.min(1, display.length - 1));
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const activeSlide = sliderRef.current?.children[activeIndex];
    activeSlide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  function scrollProducts(direction: "left" | "right") {
    setActiveIndex((current) => {
      if (direction === "left") return Math.max(current - 1, 0);
      return Math.min(current + 1, display.length - 1);
    });
  }

  return (
    <section className="overflow-hidden bg-white px-4 py-16 text-[#202020] sm:px-6 lg:py-20">
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
                className="grid h-9 w-9 place-items-center rounded-full border border-[#e6e6e6] bg-white text-[#d3d3d3] transition hover:text-[#202020]"
                type="button"
                aria-label="Previous products"
                onClick={() => scrollProducts("left")}
              >
                <ArrowLeftOutlined />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-black text-white transition hover:bg-[#b22222]"
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
            className="flex snap-x gap-10 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {display.map((product, index) => (
              <article
                key={product.id}
                className={
                  activeIndex === index
                    ? "min-w-[270px] snap-start rounded-md bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.14)] sm:min-w-[300px]"
                    : "min-w-[270px] snap-start sm:min-w-[300px]"
                }
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
                    <p className="mt-1 text-sm text-[#9b9b9b]">{product.description}</p>
                  </div>
                  <p className="font-bebas text-[1.45rem] leading-none text-[#202020]">
                    ${(product.priceCents / 100).toFixed(0)}
                  </p>
                </div>

                {product.slug ? (
                  <Link
                    href={`/store/${product.slug}`}
                    className="mt-2 inline-flex font-bebas text-sm uppercase leading-none text-[#202020]! transition hover:text-[#b22222]!"
                  >
                    Shop Now →
                  </Link>
                ) : (
                  <Link
                    href="/store"
                    className="mt-2 inline-flex font-bebas text-sm uppercase leading-none text-[#202020]! transition hover:text-[#b22222]!"
                  >
                    View Store →
                  </Link>
                )}
              </article>
            ))}
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
