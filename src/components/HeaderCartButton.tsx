"use client";

import Link from "next/link";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useCartCount } from "@/lib/use-cart-count";

export function HeaderCartButton({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const count = useCartCount();
  const label = count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart";

  return (
    <Link
      href="/store/cart"
      onClick={onNavigate}
      aria-label={label}
      title={label}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#ed2631] bg-white text-[#191919]! shadow-[0_2px_0_#ed2631] transition hover:-translate-y-px hover:bg-[#fff1f1] hover:text-[#ed2631]! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ed2631] ${className}`}
    >
      <ShoppingCartOutlined
        aria-hidden="true"
        className="block text-[20px] leading-none [&>svg]:block"
      />
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-[#ed2631] px-1 text-[10px] font-black leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
