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
      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ed2631] bg-white text-[18px] text-[#191919]! transition hover:bg-[#fff1f1] hover:text-[#ed2631]! xl:h-11 xl:w-11 ${className}`}
    >
      <ShoppingCartOutlined />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border border-white bg-[#ed2631] px-1 text-[10px] font-black leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
