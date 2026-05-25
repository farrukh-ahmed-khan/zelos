"use client";

import { FormEvent, useState } from "react";
import { message as antMessage } from "antd";
import { api, isApiSuccess } from "@/lib/api/client";

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  size?: string | null;
  color?: string | null;
};

type Order = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  items: OrderItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  giftCardCode: string | null;
  status: string;
  createdAt: string | Date;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  images: string[];
  sizes: string[];
  colors: string[];
  inventoryCount: number;
  limitedEdition: boolean;
  isActive: boolean;
  isGiftCard: boolean;
};

const statuses = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function AdminOrdersManager({
  orders,
  products,
}: {
  orders: Order[];
  products: Product[];
}) {
  const [items, setItems] = useState(orders);
  const [productItems, setProductItems] = useState(products);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);

    try {
      const response = await api.patch(`/api/admin/orders/${orderId}`, { status });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to update order.");
        return;
      }

      setItems((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order)),
      );
      antMessage.success("Order status updated.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await api.post("/api/admin/products", {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      priceCents: Math.round(Number(formData.get("priceDollars") ?? 0) * 100),
      images: String(formData.get("images") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      sizes: String(formData.get("sizes") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      colors: String(formData.get("colors") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      inventoryCount: Number(formData.get("inventoryCount") ?? 0),
      limitedEdition: formData.get("limitedEdition") === "on",
      isActive: formData.get("isActive") === "on",
      isGiftCard: formData.get("isGiftCard") === "on",
    });
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to create product.");
      return;
    }

    setProductItems((current) => [result.data.product, ...current]);
    antMessage.success("Product created.");
    form.reset();
  }

  async function toggleProduct(product: Product) {
    const response = await api.patch(`/api/admin/products/${product.id}`, {
      isActive: !product.isActive,
    });
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to update product.");
      return;
    }

    setProductItems((current) =>
      current.map((item) => (item.id === product.id ? result.data.product : item)),
    );
  }

  async function deleteProduct(productId: string) {
    const response = await api.delete(`/api/admin/products/${productId}`);
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to delete product.");
      return;
    }

    setProductItems((current) => current.filter((item) => item.id !== productId));
  }

  async function createGiftCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await api.post("/api/admin/gift-cards", {
      amountCents: Math.round(Number(formData.get("amountDollars") ?? 0) * 100),
      recipientEmail: String(formData.get("recipientEmail") ?? "") || undefined,
      purchaserEmail: String(formData.get("purchaserEmail") ?? "") || undefined,
    });
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to create gift card.");
      return;
    }

    antMessage.success(`Gift card created: ${result.data.giftCard.code}`);
    form.reset();
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={createProduct} className="grid gap-3 rounded-md border border-[#edf0f3] bg-[#f8fafc] p-4 md:grid-cols-2">
        <h3 className="text-base font-black md:col-span-2">Create Product / Gift Card Product</h3>
        <input name="name" required placeholder="Name" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="slug" required placeholder="slug" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="priceDollars" required type="number" min="0" step="0.01" placeholder="Price dollars" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="inventoryCount" required type="number" min="0" placeholder="Inventory" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="images" placeholder="Image URLs, comma separated" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <input name="sizes" placeholder="Sizes, comma separated" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="colors" placeholder="Colors, comma separated" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <textarea name="description" required placeholder="Description" className="rounded-md border border-[#d8d2c5] px-3 py-3 md:col-span-2" />
        <label className="flex items-center gap-2 text-sm font-bold"><input name="limitedEdition" type="checkbox" /> Limited edition</label>
        <label className="flex items-center gap-2 text-sm font-bold"><input name="isGiftCard" type="checkbox" /> Gift card product</label>
        <label className="flex items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Create Product</button>
      </form>

      <form onSubmit={createGiftCard} className="grid gap-3 rounded-md border border-[#edf0f3] bg-[#f8fafc] p-4 md:grid-cols-3">
        <h3 className="text-base font-black md:col-span-3">Manual Gift Card</h3>
        <input name="amountDollars" required type="number" min="1" step="0.01" placeholder="Amount dollars" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="recipientEmail" type="email" placeholder="Recipient email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="purchaserEmail" type="email" placeholder="Purchaser email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white">Generate Gift Card</button>
      </form>

      <div className="overflow-x-auto">
        <h3 className="mb-3 text-base font-black">Products</h3>
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#edf0f3] text-xs font-black uppercase text-[#667085]">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Inventory</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productItems.map((product) => (
              <tr key={product.id} className="border-b border-[#edf0f3] last:border-b-0">
                <td className="px-3 py-3">
                  <p className="font-bold">{product.name}</p>
                  <p className="text-xs text-[#667085]">{product.slug}</p>
                </td>
                <td className="px-3 py-3 font-bold">{money(product.priceCents)}</td>
                <td className="px-3 py-3">{product.inventoryCount}</td>
                <td className="px-3 py-3">{product.isGiftCard ? "Gift card" : "Swag"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleProduct(product)} className="rounded-md border px-3 py-2 text-xs font-bold">
                      {product.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="rounded-md border px-3 py-2 text-xs font-bold text-[#8c0504]">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <h3 className="mb-3 text-base font-black">Orders</h3>
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#edf0f3] text-xs font-black uppercase text-[#667085]">
            <th className="px-3 py-2">Buyer</th>
            <th className="px-3 py-2">Items</th>
            <th className="px-3 py-2">Subtotal</th>
            <th className="px-3 py-2">Gift Card</th>
            <th className="px-3 py-2">Total Paid</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((order) => (
            <tr key={order.id} className="border-b border-[#edf0f3] last:border-b-0">
              <td className="px-3 py-3">
                <p className="font-bold">
                  {order.firstName} {order.lastName}
                </p>
                <p className="text-xs text-[#667085]">{order.email}</p>
              </td>
              <td className="px-3 py-3">
                {order.items.map((item) => (
                  <p key={`${order.id}-${item.productId}-${item.size}-${item.color}`}>
                    {item.quantity}x {item.name}
                    {item.size ? ` / ${item.size}` : ""}
                    {item.color ? ` / ${item.color}` : ""}
                  </p>
                ))}
              </td>
              <td className="px-3 py-3 font-bold">{money(order.subtotalCents)}</td>
              <td className="px-3 py-3">
                {order.giftCardCode ? (
                  <>
                    <p className="font-bold">{money(order.discountCents)}</p>
                    <p className="text-xs text-[#667085]">{order.giftCardCode}</p>
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-3 py-3 font-bold">{money(order.totalCents)}</td>
              <td className="px-3 py-3">
                <select
                  value={order.status}
                  disabled={updatingId === order.id || order.status === "pending"}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                  className="rounded-md border border-[#d8d2c5] px-2 py-2 font-bold"
                >
                  {order.status === "pending" ? <option value="pending">pending</option> : null}
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length ? <p className="text-sm text-[#555]">No store orders yet.</p> : null}
      </div>
    </div>
  );
}
