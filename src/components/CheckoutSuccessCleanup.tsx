"use client";

import { useEffect } from "react";
import { CART_KEY, saveCart } from "@/lib/cart";

export function CheckoutSuccessCleanup() {
  useEffect(() => {
    saveCart([]);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CART_KEY,
        newValue: "[]",
        storageArea: window.localStorage,
      }),
    );
  }, []);

  return null;
}
