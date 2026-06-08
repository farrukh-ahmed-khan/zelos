export const CART_KEY = "zelos-store-cart";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
  size?: string;
  color?: string;
  giftCardAmountCents?: number;
};

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function cartItemCount(cart: CartItem[]): number {
  return cart.reduce((n, item) => n + item.quantity, 0);
}

export function cartSubtotalCents(cart: CartItem[]): number {
  return cart.reduce((n, item) => n + item.priceCents * item.quantity, 0);
}

export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
