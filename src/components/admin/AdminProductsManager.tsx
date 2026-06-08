"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Input, Modal, Table, Tag, message as antMessage } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import { AdminPanel } from "@/components/admin/AdminChrome";
import { api, isApiSuccess } from "@/lib/api/client";

type ProductVariant = {
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  inventoryCount: number;
  priceAdjustmentCents?: number;
  isActive?: boolean;
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
  variants: ProductVariant[];
  inventoryCount: number;
  limitedEdition: boolean;
  isActive: boolean;
  isGiftCard: boolean;
  createdAt: string;
};

type ProductForm = {
  name: string;
  description: string;
  priceCents: number;
  images: string;
  sizes: string;
  colors: string;
  inventoryCount: number;
  isActive: boolean;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function toProductForm(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    images: product.images.join(", "),
    sizes: product.sizes.join(", "),
    colors: product.colors.join(", "),
    inventoryCount: product.inventoryCount,
    isActive: product.isActive,
  };
}

export function AdminProductsManager({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((product) =>
      [
        product.name,
        product.slug,
        product.description,
        product.sizes.join(" "),
        product.colors.join(" "),
        product.isActive ? "active" : "inactive",
        product.isGiftCard ? "gift card" : "swag",
      ].join(" ").toLowerCase().includes(query),
    );
  }, [items, searchTerm]);

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total: filteredItems.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} product${total === 1 ? "" : "s"}`,
    onChange: (page, nextPageSize) => {
      setCurrentPage(page);
      setPageSize(nextPageSize);
    },
  };

  function openEdit(product: Product) {
    setEditing(product);
    setForm(toProductForm(product));
  }

  async function handleSave() {
    if (!editing || !form) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      priceCents: Number(form.priceCents),
      images: form.images.split(",").map((value) => value.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((value) => value.trim()).filter(Boolean),
      colors: form.colors.split(",").map((value) => value.trim()).filter(Boolean),
      inventoryCount: Number(form.inventoryCount),
      isActive: form.isActive,
    };

    try {
      const response = await api.patch(`/api/admin/products/${editing.id}`, payload);
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Save failed.");
        return;
      }

      setItems((current) =>
        current.map((product) => (product.id === editing.id ? result.data.product : product)),
      );
      antMessage.success("Product updated.");
      setEditing(null);
      setForm(null);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(product: Product) {
    Modal.confirm({
      title: `Delete "${product.name}"?`,
      content: "This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeletingId(product.id);
        try {
          const response = await api.delete(`/api/admin/products/${product.id}`);
          const result = response.data;

          if (!isApiSuccess(response.status)) {
            antMessage.error(result?.error?.message ?? "Delete failed.");
            return;
          }

          setItems((current) => current.filter((item) => item.id !== product.id));
          antMessage.success("Product deleted.");
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  const columns: TableColumnsType<Product> = [
    {
      title: "Product",
      key: "product",
      width: 360,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, product) => (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[#111827]">{product.name}</span>
            {product.limitedEdition ? <Tag color="gold">Limited</Tag> : null}
          </div>
          <div className="text-xs text-[#667085]">{product.slug}</div>
          <div className="line-clamp-2 text-xs text-[#667085]">{product.description}</div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "priceCents",
      key: "priceCents",
      width: 130,
      sorter: (a, b) => a.priceCents - b.priceCents,
      render: (priceCents: number) => <span className="font-bold">{money(priceCents)}</span>,
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
      width: 130,
      sorter: (a, b) => a.variants.length - b.variants.length,
      render: (_, product) => <Tag color={product.variants.length ? "cyan" : "default"}>{product.variants.length}</Tag>,
    },
    {
      title: "Type",
      key: "type",
      width: 130,
      filters: [
        { text: "Gift card", value: "gift-card" },
        { text: "Swag", value: "swag" },
      ],
      onFilter: (value, product) => (value === "gift-card" ? product.isGiftCard : !product.isGiftCard),
      render: (_, product) => <Tag color={product.isGiftCard ? "purple" : "blue"}>{product.isGiftCard ? "Gift card" : "Swag"}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, product) => (value === "active" ? product.isActive : !product.isActive),
      render: (_, product) => <Tag color={product.isActive ? "green" : "default"}>{product.isActive ? "ACTIVE" : "INACTIVE"}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, product) => (
        <div className="flex flex-wrap gap-2">
          <Button size="small" onClick={() => openEdit(product)}>
            Edit
          </Button>
          <Button size="small" danger loading={deletingId === product.id} onClick={() => confirmDelete(product)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#667085]">
          {items.length} product{items.length !== 1 ? "s" : ""}
        </span>
        <Link
          href="/admin/orders"
          className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black !text-[#212121] shadow-[0_3px_0_#111]"
        >
          + Add Product
        </Link>
      </div>

      <AdminPanel title="Products">
        <div className="grid gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search products by name, slug, status, type, size, or color"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="max-w-xl"
          />
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            pagination={pagination}
            scroll={{ x: 1430 }}
            bordered
            locale={{ emptyText: "No products found" }}
          />
        </div>
      </AdminPanel>

      <Modal
        open={Boolean(editing && form)}
        onCancel={() => {
          setEditing(null);
          setForm(null);
        }}
        onOk={handleSave}
        okText={saving ? "Saving..." : "Save Changes"}
        okButtonProps={{ disabled: saving || !form?.name.trim() }}
        title={editing ? `Edit: ${editing.name}` : "Edit Product"}
        width={600}
      >
        {form ? (
          <div className="grid gap-4 py-2 text-sm">
            {(["name", "description"] as const).map((field) => (
              <label key={field} className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                {field}
                <input
                  value={form[field]}
                  onChange={(event) => setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev))}
                  className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
                />
              </label>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Price (cents)
                <input
                  type="number"
                  min={0}
                  value={form.priceCents}
                  onChange={(event) => setForm((prev) => (prev ? { ...prev, priceCents: Number(event.target.value) } : prev))}
                  className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal text-[#202020] outline-none focus:border-[#8c0504]"
                />
                <span className="text-[11px] font-normal normal-case text-[#667085]">
                  = {money(form.priceCents)}
                </span>
              </label>
              <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                Inventory count
                <input
                  type="number"
                  min={0}
                  value={form.inventoryCount}
                  onChange={(event) => setForm((prev) => (prev ? { ...prev, inventoryCount: Number(event.target.value) } : prev))}
                  className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal text-[#202020] outline-none focus:border-[#8c0504]"
                />
              </label>
            </div>
            {(["sizes", "colors", "images"] as const).map((field) => (
              <label key={field} className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
                {field} <span className="font-normal normal-case text-[#667085]">(comma-separated)</span>
                <input
                  value={form[field]}
                  onChange={(event) => setForm((prev) => (prev ? { ...prev, [field]: event.target.value } : prev))}
                  className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
                />
              </label>
            ))}
            <label className="flex items-center gap-3 text-sm font-semibold text-[#202020]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => (prev ? { ...prev, isActive: event.target.checked } : prev))}
                className="accent-[#8c0504]"
              />
              Active
            </label>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
