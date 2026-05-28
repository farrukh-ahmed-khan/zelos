"use client";

import { FormEvent, useState } from "react";
import { Button, Select, Table, Tag, message as antMessage } from "antd";
import type { ColumnsType } from "antd/es/table";
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
  const productTypeFilters = [
    { text: "Gift card", value: "gift-card" },
    { text: "Swag", value: "swag" },
  ];
  const productStatusFilters = [
    { text: "Active", value: "active" },
    { text: "Inactive", value: "inactive" },
  ];
  const orderStatusFilters = Array.from(new Set(items.map((order) => order.status))).map((status) => ({
    text: status,
    value: status,
  }));

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

  const productColumns: ColumnsType<Product> = [
    {
      title: "Product",
      key: "product",
      width: 280,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, product) => (
        <div>
          <p className="font-bold">{product.name}</p>
          <p className="text-xs text-[#667085]">{product.slug}</p>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "priceCents",
      key: "priceCents",
      width: 130,
      sorter: (a, b) => a.priceCents - b.priceCents,
      render: (priceCents) => <span className="font-bold">{money(priceCents)}</span>,
    },
    {
      title: "Inventory",
      dataIndex: "inventoryCount",
      key: "inventoryCount",
      width: 130,
      sorter: (a, b) => a.inventoryCount - b.inventoryCount,
    },
    {
      title: "Type",
      key: "type",
      width: 130,
      filters: productTypeFilters,
      onFilter: (value, product) => (value === "gift-card" ? product.isGiftCard : !product.isGiftCard),
      render: (_, product) => <Tag color={product.isGiftCard ? "purple" : "blue"}>{product.isGiftCard ? "Gift card" : "Swag"}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      filters: productStatusFilters,
      onFilter: (value, product) => (value === "active" ? product.isActive : !product.isActive),
      render: (_, product) => <Tag color={product.isActive ? "green" : "default"}>{product.isActive ? "ACTIVE" : "INACTIVE"}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, product) => (
        <div className="flex flex-wrap gap-2">
          <Button size="small" onClick={() => toggleProduct(product)}>
            {product.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button size="small" danger onClick={() => deleteProduct(product.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const orderColumns: ColumnsType<Order> = [
    {
      title: "Buyer",
      key: "buyer",
      width: 260,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, order) => (
        <div>
          <p className="font-bold">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-xs text-[#667085]">{order.email}</p>
        </div>
      ),
    },
    {
      title: "Items",
      key: "items",
      width: 360,
      render: (_, order) => (
        <div className="grid gap-1">
          {order.items.map((item) => (
            <p key={`${order.id}-${item.productId}-${item.size}-${item.color}`} className="text-sm">
              {item.quantity}x {item.name}
              {item.size ? ` / ${item.size}` : ""}
              {item.color ? ` / ${item.color}` : ""}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotalCents",
      key: "subtotalCents",
      width: 130,
      sorter: (a, b) => a.subtotalCents - b.subtotalCents,
      render: (value) => <span className="font-bold">{money(value)}</span>,
    },
    {
      title: "Gift Card",
      key: "giftCard",
      width: 160,
      filters: [
        { text: "Used", value: "used" },
        { text: "Not used", value: "none" },
      ],
      onFilter: (value, order) => (value === "used" ? Boolean(order.giftCardCode) : !order.giftCardCode),
      render: (_, order) =>
        order.giftCardCode ? (
          <div>
            <p className="font-bold">{money(order.discountCents)}</p>
            <p className="text-xs text-[#667085]">{order.giftCardCode}</p>
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "Total Paid",
      dataIndex: "totalCents",
      key: "totalCents",
      width: 140,
      sorter: (a, b) => a.totalCents - b.totalCents,
      render: (value) => <span className="font-bold">{money(value)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 190,
      filters: orderStatusFilters,
      onFilter: (value, order) => order.status === value,
      render: (_, order) => (
        <Select
          value={order.status}
          disabled={updatingId === order.id || order.status === "pending"}
          onChange={(value) => updateStatus(order.id, value)}
          style={{ minWidth: 150 }}
          options={[
            ...(order.status === "pending" ? [{ value: "pending", label: "pending" }] : []),
            ...statuses.map((status) => ({ value: status, label: status })),
          ]}
        />
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      defaultSortOrder: "descend",
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

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

      <div className="rounded-md border border-[#edf0f3] bg-white p-4">
        <h3 className="mb-3 text-base font-black">Products</h3>
        <Table
          columns={productColumns}
          dataSource={productItems}
          rowKey="id"
          scroll={{ x: 1050 }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
        />
      </div>

      <div className="rounded-md border border-[#edf0f3] bg-white p-4">
        <h3 className="mb-3 text-base font-black">Orders</h3>
        <Table
          columns={orderColumns}
          dataSource={items}
          rowKey="id"
          scroll={{ x: 1430 }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          locale={{ emptyText: "No store orders yet." }}
        />
      </div>
    </div>
  );
}
