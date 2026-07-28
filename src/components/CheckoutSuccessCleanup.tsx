"use client";

import { useEffect } from "react";
import { saveCart } from "@/lib/cart";

export function CheckoutSuccessCleanup() {
  useEffect(() => {
    saveCart([]);
  }, []);

  return null;
}
