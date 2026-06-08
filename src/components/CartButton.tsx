"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_KEY } from "@/lib/cart";

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        const items: Array<{ quantity?: number }> = JSON.parse(raw ?? "[]");
        setCount(
          Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity ?? 0), 0) : 0,
        );
      } catch {
        setCount(0);
      }
    }
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return (
    <Link
      href="/store/cart"
      className="relative inline-flex items-center gap-2 rounded-md border-2 border-[#212121] bg-white px-4 py-2.5 text-sm font-black text-[#212121]! shadow-[0_3px_0_#111] transition hover:bg-[#f9f9f9] active:shadow-[0_1px_0_#111]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span>Cart</span>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#8c0504] px-1 text-[10px] font-black text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
