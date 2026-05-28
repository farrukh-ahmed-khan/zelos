"use client";

import { useEffect, useState } from "react";
import { Modal, message as antMessage } from "antd";
import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { api, isApiSuccess } from "@/lib/api/client";

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
  isActive: boolean;
  isGiftCard: boolean;
  createdAt: string;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  priceCents: 0,
  images: "",
  sizes: "",
  colors: "",
  inventoryCount: 0,
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/products");
      if (isApiSuccess(res.status)) setProducts(res.data.data.products);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      images: product.images.join(", "),
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      inventoryCount: product.inventoryCount,
      isActive: product.isActive,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      priceCents: Number(form.priceCents),
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      inventoryCount: Number(form.inventoryCount),
      isActive: form.isActive,
    };
    try {
      const res = editing
        ? await api.patch(`/api/admin/products/${editing.id}`, payload)
        : await api.post("/api/admin/products", payload);
      if (isApiSuccess(res.status)) {
        antMessage.success(editing ? "Product updated." : "Product created.");
        setModalOpen(false);
        void load();
      } else {
        antMessage.error(res.data?.error?.message ?? "Save failed.");
      }
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
          const res = await api.delete(`/api/admin/products/${product.id}`);
          if (isApiSuccess(res.status)) {
            antMessage.success("Product deleted.");
            void load();
          } else {
            antMessage.error(res.data?.error?.message ?? "Delete failed.");
          }
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  return (
    <AdminChrome title="Store Products" eyebrow="Admin / Store">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#667085]">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={openCreate}
          className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2 text-sm font-black text-[#212121] shadow-[0_3px_0_#111]"
        >
          + Add Product
        </button>
      </div>

      <AdminPanel title="Products">
        {loading ? (
          <p className="text-sm text-[#667085]">Loading…</p>
        ) : !products.length ? (
          <p className="text-sm text-[#667085]">No products yet. Add one above.</p>
        ) : (
          <div className="overflow-hidden rounded-md border border-[#edf0f3]">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-3 border-b border-[#edf0f3] px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_120px_120px_auto_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-[#111827]">{product.name}</p>
                    {!product.isActive ? (
                      <span className="rounded-sm bg-[#ffe8e6] px-2 py-0.5 text-[10px] font-black uppercase text-[#8c0504]">Inactive</span>
                    ) : null}
                    {product.isGiftCard ? (
                      <span className="rounded-sm bg-[#eaf3ff] px-2 py-0.5 text-[10px] font-black uppercase text-[#175cd3]">Gift Card</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#667085]">{product.description}</p>
                </div>
                <div className="flex items-center text-sm font-bold text-[#202020]">
                  ${(product.priceCents / 100).toFixed(2)}
                </div>
                <div className="flex items-center text-xs text-[#667085]">
                  Stock: {product.inventoryCount}
                </div>
                <button
                  onClick={() => openEdit(product)}
                  className="rounded-md border border-[#d9dde3] bg-white px-3 py-2 text-xs font-bold text-[#202020] hover:border-[#8c0504] hover:text-[#8c0504]"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(product)}
                  disabled={deletingId === product.id}
                  className="rounded-md border border-[#ffe8e6] bg-[#ffe8e6] px-3 py-2 text-xs font-bold text-[#8c0504] hover:bg-[#ffd5d2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === product.id ? "…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
        okButtonProps={{ disabled: saving || !form.name.trim() }}
        title={editing ? `Edit: ${editing.name}` : "Add New Product"}
        width={600}
      >
        <div className="grid gap-4 py-2 text-sm">
          {(["name", "description"] as const).map((field) => (
            <label key={field} className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              {field}
              <input
                value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
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
                onChange={(e) => setForm((prev) => ({ ...prev, priceCents: Number(e.target.value) }))}
                className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal text-[#202020] outline-none focus:border-[#8c0504]"
              />
              <span className="text-[11px] font-normal normal-case text-[#667085]">
                = ${(form.priceCents / 100).toFixed(2)}
              </span>
            </label>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Inventory count
              <input
                type="number"
                min={0}
                value={form.inventoryCount}
                onChange={(e) => setForm((prev) => ({ ...prev, inventoryCount: Number(e.target.value) }))}
                className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal text-[#202020] outline-none focus:border-[#8c0504]"
              />
            </label>
          </div>
          {(["sizes", "colors", "images"] as const).map((field) => (
            <label key={field} className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              {field} <span className="font-normal normal-case text-[#667085]">(comma-separated)</span>
              <input
                value={form[field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={field === "images" ? "https://…, https://…" : "S, M, L, XL"}
                className="rounded-md border border-[#d9dde3] px-3 py-2 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
              />
            </label>
          ))}
          <label className="flex items-center gap-3 text-sm font-semibold text-[#202020]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="accent-[#8c0504]"
            />
            Active (visible in store)
          </label>
        </div>
      </Modal>
    </AdminChrome>
  );
}
