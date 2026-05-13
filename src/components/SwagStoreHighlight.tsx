"use client";

import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const products = [
  {
    title: "Zelos Signature Hoodie",
    description: "Available In Navy, Teal, And Black",
    price: "$45",
    image: "/assets/swag-hoodie.png",
  },
  {
    title: "Money Minds Tee (Youth)",
    description: "Sizes S-XL - Youth Cut",
    price: "$22",
    image: "/assets/swag-tee.png",
  },
  {
    title: "Zelos Cap - Limited Edition",
    description: "Limited Run - While Stocks Last",
    price: "$28",
    image: "/assets/swag-cap.png",
  },
  {
    title: "Zelos Signature Hoodie",
    description: "Available In Navy, Teal, And Black",
    price: "$45",
    image: "/assets/swag-hoodie.png",
  },
];

export function SwagStoreHighlight() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const activeSlide = sliderRef.current?.children[activeIndex];
    activeSlide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  function scrollProducts(direction: "left" | "right") {
    setActiveIndex((currentIndex) => {
      if (direction === "left") {
        return Math.max(currentIndex - 1, 0);
      }

      return Math.min(currentIndex + 1, products.length - 1);
    });
  }

  return (
    <section className="overflow-hidden bg-white px-4 py-16 text-[#202020] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow-red mb-1">
                Shop Now
              </p>
              <h2 className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text font-bebas text-[56px] font-bold uppercase leading-[50px] tracking-[-1px] text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] sm:text-[70px] sm:leading-[62px] sm:tracking-[-2px]">
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
            {products.map((product, index) => (
              <article
                className={
                  activeIndex === index
                    ? "min-w-[270px] snap-start rounded-md bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.14)] sm:min-w-[300px]"
                    : "min-w-[270px] snap-start sm:min-w-[300px]"
                }
                key={`${product.title}-${index}`}
              >
                <div className="relative aspect-[0.91] overflow-hidden rounded-md bg-[#f1f1f1]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bebas text-[1.45rem] uppercase leading-none text-[#202020]">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#9b9b9b]">{product.description}</p>
                  </div>
                  <p className="font-bebas text-[1.45rem] leading-none text-[#202020]">
                    {product.price}
                  </p>
                </div>

                <a
                  href="#"
                  className="mt-2 inline-flex font-bebas text-sm uppercase leading-none !text-[#202020] transition hover:!text-[#b22222]"
                >
                  Add To Cart
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
