"use client";

import { useEffect, useState } from "react";
import { loadCart } from "@/lib/cart";

/**
 * Live total quantity in the cart. Starts at 0 so server and client markup
 * match, then syncs on mount and on every cart write (see `notifyCartChange`).
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function read() {
      setCount(loadCart().reduce((sum, item) => sum + (item.quantity ?? 0), 0));
    }

    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return count;
}
