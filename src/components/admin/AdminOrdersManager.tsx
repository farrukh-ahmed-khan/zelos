"use client";

import { FormEvent, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Table,
  Tag,
  message as antMessage,
} from "antd";
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
  variants?: ProductVariant[];
  inventoryCount: number;
  limitedEdition: boolean;
  isActive: boolean;
  isGiftCard: boolean;
};

type ProductVariant = {
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  inventoryCount: number;
  priceAdjustmentCents?: number;
  isActive?: boolean;
};

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  priceDollars: number;
  inventoryCount?: number;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  limitedEdition?: boolean;
  isGiftCard?: boolean;
  isActive?: boolean;
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
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productActionId, setProductActionId] = useState<string | null>(null);
  const [isCreatingGiftCard, setIsCreatingGiftCard] = useState(false);
  const [form] = Form.useForm<ProductFormValues>();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
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

  function updateVariant(index: number, updates: Partial<ProductVariant>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...updates } : variant,
      ),
    );
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        sku: "",
        size: "",
        color: "",
        inventoryCount: 0,
        priceAdjustmentCents: 0,
        isActive: true,
      },
    ]);
  }

  function generateVariants() {
    const sizes = form.getFieldValue("sizes") ?? [];
    const colors = form.getFieldValue("colors") ?? [];
    const baseSlug = form.getFieldValue("slug") || "SKU";
    const normalizedSizes = sizes.length ? sizes : [""];
    const normalizedColors = colors.length ? colors : [""];

    const nextVariants = normalizedSizes.flatMap((size: string) =>
      normalizedColors.map((color: string) => ({
        sku: [baseSlug, size, color]
          .filter(Boolean)
          .join("-")
          .replace(/\s+/g, "-")
          .toUpperCase(),
        size,
        color,
        inventoryCount: 0,
        priceAdjustmentCents: 0,
        isActive: true,
      })),
    );

    setVariants(nextVariants);
  }

  async function createProduct(values: ProductFormValues) {
    setIsCreatingProduct(true);
    const cleanVariants = variants
      .filter((variant) => variant.size || variant.color || variant.sku)
      .map((variant) => ({
        sku: variant.sku ?? "",
        size: variant.size ?? "",
        color: variant.color ?? "",
        inventoryCount: variant.inventoryCount,
        priceAdjustmentCents: variant.priceAdjustmentCents ?? 0,
        isActive: variant.isActive ?? true,
      }));
    const inventoryCount = cleanVariants.length
      ? cleanVariants.reduce((sum, variant) => sum + variant.inventoryCount, 0)
      : Number(values.inventoryCount ?? 0);
    try {
      const response = await api.post("/api/admin/products", {
        name: values.name,
        slug: values.slug,
        description: values.description,
        priceCents: Math.round(Number(values.priceDollars ?? 0) * 100),
        images: values.images ?? [],
        sizes: values.sizes ?? [],
        colors: values.colors ?? [],
        variants: cleanVariants,
        inventoryCount,
        limitedEdition: Boolean(values.limitedEdition),
        isActive: values.isActive !== false,
        isGiftCard: Boolean(values.isGiftCard),
      });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to create product.");
        return;
      }

      setProductItems((current) => [result.data.product, ...current]);
      antMessage.success("Product created.");
      form.resetFields();
      setVariants([]);
    } finally {
      setIsCreatingProduct(false);
    }
  }

  async function toggleProduct(product: Product) {
    setProductActionId(product.id);
    try {
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
    } finally {
      setProductActionId(null);
    }
  }

  async function deleteProduct(productId: string) {
    setProductActionId(productId);
    try {
      const response = await api.delete(`/api/admin/products/${productId}`);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to delete product.");
        return;
      }

      setProductItems((current) => current.filter((item) => item.id !== productId));
    } finally {
      setProductActionId(null);
    }
  }

  async function createGiftCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingGiftCard(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
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
    } finally {
      setIsCreatingGiftCard(false);
    }
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
      title: "Variants",
      key: "variants",
      width: 150,
      sorter: (a, b) => (a.variants?.length ?? 0) - (b.variants?.length ?? 0),
      render: (_, product) => (
        <Tag color={(product.variants?.length ?? 0) ? "cyan" : "default"}>
          {product.variants?.length ?? 0} variants
        </Tag>
      ),
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
          <Button size="small" loading={productActionId === product.id} onClick={() => toggleProduct(product)}>
            {product.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button size="small" danger loading={productActionId === product.id} onClick={() => deleteProduct(product.id)}>
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

  const variantColumns: ColumnsType<ProductVariant & { key: number }> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 180,
      render: (_, variant, index) => (
        <Input
          value={variant.sku ?? ""}
          onChange={(event) => updateVariant(index, { sku: event.target.value })}
          placeholder="SKU"
        />
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 130,
      render: (_, variant, index) => (
        <Input
          value={variant.size ?? ""}
          onChange={(event) => updateVariant(index, { size: event.target.value })}
          placeholder="Size"
        />
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 150,
      render: (_, variant, index) => (
        <Input
          value={variant.color ?? ""}
          onChange={(event) => updateVariant(index, { color: event.target.value })}
          placeholder="Color"
        />
      ),
    },
    {
      title: "Stock",
      dataIndex: "inventoryCount",
      key: "inventoryCount",
      width: 120,
      render: (_, variant, index) => (
        <InputNumber
          min={0}
          value={variant.inventoryCount}
          onChange={(value) => updateVariant(index, { inventoryCount: Number(value ?? 0) })}
          className="w-full"
        />
      ),
    },
    {
      title: "Price +/-",
      dataIndex: "priceAdjustmentCents",
      key: "priceAdjustmentCents",
      width: 140,
      render: (_, variant, index) => (
        <InputNumber
          value={(variant.priceAdjustmentCents ?? 0) / 100}
          step={0.01}
          formatter={(value) => `$ ${value}`}
          parser={(value) => Number(value?.replace(/\$\s?/g, "") ?? 0)}
          onChange={(value) => updateVariant(index, { priceAdjustmentCents: Math.round(Number(value ?? 0) * 100) })}
          className="w-full"
        />
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (_, variant, index) => (
        <Switch
          checked={variant.isActive !== false}
          onChange={(checked) => updateVariant(index, { isActive: checked })}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 90,
      render: (_, __, index) => (
        <Button size="small" danger onClick={() => removeVariant(index)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <Card
        title="Create Product"
        className="rounded-md border-[#d9dde3]"
        extra={<Tag color="red">Ecommerce Catalog</Tag>}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, limitedEdition: false, isGiftCard: false }}
          onFinish={createProduct}
        >
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card size="small" title="Product Details" className="rounded-md">
              <div className="grid gap-3 md:grid-cols-2">
                <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                  <Input placeholder="Zelos Hoodie" />
                </Form.Item>
                <Form.Item name="slug" label="URL Slug" rules={[{ required: true }]}>
                  <Input placeholder="zelos-hoodie" />
                </Form.Item>
                <Form.Item name="priceDollars" label="Base Price" rules={[{ required: true }]}>
                  <InputNumber min={0} step={0.01} prefix="$" className="w-full" placeholder="49.00" />
                </Form.Item>
                <Form.Item name="inventoryCount" label="Default Stock" tooltip="Used when no variants are generated. Variant stock is summed automatically.">
                  <InputNumber min={0} className="w-full" placeholder="25" />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true }]} className="md:col-span-2">
                  <Input.TextArea rows={5} placeholder="Describe the product, fit, materials, and customer-facing details." />
                </Form.Item>
              </div>
            </Card>

            <Card size="small" title="Media & Publishing" className="rounded-md">
              <Form.Item name="images" label="Image URLs">
                <Select mode="tags" tokenSeparators={[",", "\n"]} placeholder="Paste image URLs and press Enter" />
              </Form.Item>
              <div className="grid gap-3 sm:grid-cols-3">
                <Form.Item name="limitedEdition" label="Limited Edition" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="isGiftCard" label="Gift Card" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="isActive" label="Published" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>
            </Card>
          </div>

          <Divider />

          <Card size="small" title="Options & Variations" className="rounded-md">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <Form.Item name="sizes" label="Sizes">
                <Select mode="tags" tokenSeparators={[","]} placeholder="S, M, L, XL" />
              </Form.Item>
              <Form.Item name="colors" label="Colors">
                <Select mode="tags" tokenSeparators={[","]} placeholder="Black, White, Red" />
              </Form.Item>
              <div className="flex flex-wrap items-end gap-2 pb-6">
                <Button onClick={generateVariants}>Generate Variants</Button>
                <Button onClick={addVariant}>Add Variant</Button>
              </div>
            </div>
            <Table
              columns={variantColumns}
              dataSource={variants.map((variant, index) => ({ ...variant, key: index }))}
              rowKey="key"
              pagination={false}
              scroll={{ x: 900 }}
              locale={{ emptyText: "Add sizes/colors, then generate variants. Gift cards can be created without variants." }}
            />
          </Card>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Button onClick={() => {
              form.resetFields();
              setVariants([]);
            }}>
              Clear
            </Button>
            <Button type="primary" htmlType="submit" loading={isCreatingProduct}>
              Create Product
            </Button>
          </div>
        </Form>
      </Card>

      <form onSubmit={createGiftCard} className="grid gap-3 rounded-md border border-[#edf0f3] bg-[#f8fafc] p-4 md:grid-cols-3">
        <h3 className="text-base font-black md:col-span-3">Manual Gift Card</h3>
        <input name="amountDollars" required type="number" min="1" step="0.01" placeholder="Amount dollars" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="recipientEmail" type="email" placeholder="Recipient email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <input name="purchaserEmail" type="email" placeholder="Purchaser email" className="rounded-md border border-[#d8d2c5] px-3 py-3" />
        <button disabled={isCreatingGiftCard} className="w-fit rounded-md bg-[#202020] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isCreatingGiftCard ? "Generating..." : "Generate Gift Card"}
        </button>
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
