"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  message as antMessage,
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { api, isApiSuccess } from "@/lib/api/client";

type PrintifyShop = {
  id: number;
  title: string;
  sales_channel: string;
};

type PrintifyWebhook = {
  id: string;
  topic: string;
  url: string;
};

type PrintifyProduct = {
  id: string;
  title: string;
  category?: string;
  categorySlug?: string;
  categorySource?: "printify" | "admin";
  tags?: string[];
  visible?: boolean;
  imported?: boolean;
  localProductId?: string | null;
  localIsActive?: boolean;
  variants?: Array<{
    id: number;
    sku?: string;
    price: number;
    title: string;
    is_enabled?: boolean;
    is_available?: boolean;
  }>;
  images?: Array<{ src: string; is_default?: boolean }>;
  updated_at?: string;
};

type Blueprint = {
  id: number;
  title: string;
  brand: string;
  model: string;
};

type PrintProvider = {
  id: number;
  title: string;
};

type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function AdminPrintifyManager({
  canManageCategories,
}: {
  canManageCategories: boolean;
}) {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [installingWebhooks, setInstallingWebhooks] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shops, setShops] = useState<PrintifyShop[]>([]);
  const [webhooks, setWebhooks] = useState<PrintifyWebhook[]>([]);
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [assigningCategoryId, setAssigningCategoryId] = useState<string | null>(null);
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [providers, setProviders] = useState<PrintProvider[]>([]);
  const [catalogPayload, setCatalogPayload] = useState<unknown>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const currentShop = useMemo(
    () => shops.find((shop) => String(shop.id) === String(shopId)),
    [shopId, shops],
  );

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const response = await api.get("/api/admin/printify/status");
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to load Printify status.");
        return;
      }

      setConfigured(Boolean(result.data.configured));
      setShopId(result.data.shopId);
      setShops(result.data.shops ?? []);
      setWebhooks(result.data.webhooks ?? []);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const response = await api.get("/api/admin/printify/products?limit=50");
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to load Printify products.");
        return;
      }

      setProducts(result.data.data ?? []);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCategories() {
    const response = await api.get("/api/admin/printify/categories");
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to load store categories.");
      return;
    }

    setCategories(result.data.categories ?? []);
  }

  async function createCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreatingCategory(true);
    try {
      const response = await api.post("/api/admin/printify/categories", { name });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to create store category.");
        return;
      }

      setCategories((current) =>
        [...current, result.data.category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewCategoryName("");
      antMessage.success("Store category created.");
    } finally {
      setCreatingCategory(false);
    }
  }

  function startEditingCategory(category: StoreCategory) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }

  function cancelEditingCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function updateCategory(category: StoreCategory) {
    const name = editingCategoryName.trim();

    if (!name || name === category.name) {
      cancelEditingCategory();
      return;
    }

    setSavingCategoryId(category.id);
    try {
      const response = await api.patch(
        `/api/admin/printify/categories/${encodeURIComponent(category.id)}`,
        { name },
      );
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to update store category.");
        return;
      }

      const updatedCategory = result.data.category as StoreCategory;
      setCategories((current) =>
        current
          .map((entry) => (entry.id === category.id ? updatedCategory : entry))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setProducts((current) =>
        current.map((product) =>
          product.categorySlug === category.slug ||
          product.category?.toLowerCase() === category.name.toLowerCase()
            ? {
                ...product,
                category: updatedCategory.name,
                categorySlug: updatedCategory.slug,
                categorySource: "admin",
              }
            : product,
        ),
      );
      cancelEditingCategory();
      antMessage.success(
        result.data.updatedProductCount
          ? `Category updated on ${result.data.updatedProductCount} product(s).`
          : "Store category updated.",
      );
    } finally {
      setSavingCategoryId(null);
    }
  }

  async function deleteCategory(category: StoreCategory) {
    setDeletingCategoryId(category.id);
    try {
      const response = await api.delete(
        `/api/admin/printify/categories/${encodeURIComponent(category.id)}`,
      );
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to delete store category.");
        return;
      }

      setCategories((current) => current.filter((entry) => entry.id !== category.id));
      setProducts((current) =>
        current.map((product) =>
          product.categorySlug === category.slug ||
          product.category?.toLowerCase() === category.name.toLowerCase()
            ? {
                ...product,
                category: "",
                categorySlug: "",
                categorySource: "printify",
              }
            : product,
        ),
      );

      if (editingCategoryId === category.id) {
        cancelEditingCategory();
      }

      antMessage.success(
        result.data.unassignedProductCount
          ? `Category deleted and removed from ${result.data.unassignedProductCount} product(s).`
          : "Store category deleted.",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  }

  function confirmDeleteCategory(category: StoreCategory) {
    Modal.confirm({
      title: `Delete "${category.name}"?`,
      content:
        "This category will be permanently deleted. Products assigned to it will become uncategorized.",
      okText: "Delete Category",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteCategory(category),
    });
  }

  async function assignCategory(productId: string, categoryId: string) {
    setAssigningCategoryId(productId);
    try {
      const response = await api.patch(
        `/api/admin/printify/products/${encodeURIComponent(productId)}/category`,
        { categoryId },
      );
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to assign product category.");
        return;
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                category: result.data.product.category,
                categorySlug: result.data.product.categorySlug,
                categorySource: "admin",
              }
            : product,
        ),
      );
      antMessage.success("Product category updated.");
    } finally {
      setAssigningCategoryId(null);
    }
  }

  async function importProduct(productId: string) {
    setImportingId(productId);
    try {
      const response = await api.post("/api/admin/printify/products", { productId });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to import product.");
        return;
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                imported: true,
                localProductId: result.data.product.id,
                localIsActive: result.data.product.isActive,
                category: result.data.product.category,
                categorySlug: result.data.product.categorySlug,
                categorySource: result.data.product.categorySource,
              }
            : product,
        ),
      );
      antMessage.success("Product imported.");
    } finally {
      setImportingId(null);
    }
  }

  async function importAllProducts() {
    setSyncingProducts(true);
    try {
      const response = await api.post("/api/admin/printify/products", { all: true });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to import products.");
        return;
      }

      antMessage.success(`${result.data.count} products imported.`);
      await loadProducts();
    } finally {
      setSyncingProducts(false);
    }
  }

  async function installWebhooks() {
    setInstallingWebhooks(true);
    try {
      const response = await api.post("/api/admin/printify/webhooks", {});
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to install webhooks.");
        return;
      }

      antMessage.success(result.data.message);
      await loadStatus();
    } finally {
      setInstallingWebhooks(false);
    }
  }

  async function loadBlueprints() {
    const response = await api.get("/api/admin/printify/catalog");
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to load catalog.");
      return;
    }

    setBlueprints(result.data.blueprints ?? []);
  }

  async function loadProviders(blueprintId: number) {
    setSelectedBlueprint(blueprintId);
    setSelectedProvider(null);
    setCatalogPayload(null);
    const response = await api.get(`/api/admin/printify/catalog?blueprintId=${blueprintId}`);
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to load print providers.");
      return;
    }

    setProviders(result.data.printProviders ?? []);
  }

  async function loadProviderPayload(printProviderId: number, shipping = false) {
    if (!selectedBlueprint) return;

    setSelectedProvider(printProviderId);
    const params = new URLSearchParams({
      blueprintId: String(selectedBlueprint),
      printProviderId: String(printProviderId),
      ...(shipping ? { shipping: "true" } : {}),
    });
    const response = await api.get(`/api/admin/printify/catalog?${params.toString()}`);
    const result = response.data;

    if (!isApiSuccess(response.status)) {
      antMessage.error(result?.error?.message ?? "Unable to load catalog details.");
      return;
    }

    setCatalogPayload(result.data);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([
        loadStatus(),
        loadProducts(),
        ...(canManageCategories ? [loadCategories()] : []),
      ]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canManageCategories]);

  const productColumns: ColumnsType<PrintifyProduct> = [
    {
      title: "Product",
      key: "product",
      width: 360,
      render: (_, product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0]?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0].src}
              alt={product.title}
              className="h-12 w-12 rounded object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate font-bold">{product.title}</p>
            <p className="truncate text-xs text-[#667085]">{product.id}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: canManageCategories ? 210 : 150,
      render: (category: string | undefined, product) => {
        if (!canManageCategories) {
          return (
            <Tag color={category ? "blue" : "default"} title={(product.tags ?? []).join(", ")}>
              {category || "Uncategorized"}
            </Tag>
          );
        }

        const selectedCategory = categories.find(
          (entry) =>
            entry.slug === product.categorySlug ||
            entry.name.toLowerCase() === product.category?.toLowerCase(),
        );

        return (
          <Select
            className="w-full"
            size="small"
            value={selectedCategory?.id}
            placeholder={product.imported ? category || "Select category" : "Import first"}
            disabled={!product.imported}
            loading={assigningCategoryId === product.id}
            onChange={(categoryId) => void assignCategory(product.id, categoryId)}
            options={categories.map((entry) => ({
              value: entry.id,
              label: entry.name,
            }))}
          />
        );
      },
    },
    {
      title: "Price",
      key: "price",
      width: 130,
      render: (_, product) => {
        const prices = (product.variants ?? []).map((variant) => variant.price);
        return prices.length ? money(Math.min(...prices)) : "-";
      },
    },
    {
      title: "Variants",
      key: "variants",
      width: 120,
      render: (_, product) => <Tag color="cyan">{product.variants?.length ?? 0}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      width: 190,
      render: (_, product) => (
        <div className="flex flex-wrap gap-1">
          <Tag color={product.visible === false ? "default" : "cyan"}>
            {product.visible === false ? "HIDDEN" : "PRINTIFY LIVE"}
          </Tag>
          <Tag color={product.imported ? "green" : "orange"}>
            {product.imported ? "IMPORTED" : "NOT IMPORTED"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: (_, product) => (
        <Button
          size="small"
          loading={importingId === product.id}
          onClick={() => importProduct(product.id)}
        >
          {product.imported ? "Sync" : "Import"}
        </Button>
      ),
    },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase text-[#667085]">Connection</p>
          <div className="mt-2 flex items-center gap-2">
            <Tag color={configured ? "green" : "red"}>{configured ? "CONFIGURED" : "MISSING ENV"}</Tag>
            <Button size="small" loading={loadingStatus} onClick={loadStatus}>
              Refresh
            </Button>
          </div>
        </Card>
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase text-[#667085]">Active Shop</p>
          <p className="mt-2 truncate text-base font-black">{currentShop?.title ?? shopId ?? "-"}</p>
          <p className="truncate text-xs text-[#667085]">{currentShop?.sales_channel ?? ""}</p>
        </Card>
        <Card className="rounded-md border-[#d9dde3]">
          <p className="text-xs font-black uppercase text-[#667085]">Webhooks</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-black">{webhooks.length}</span>
            <Button size="small" loading={installingWebhooks} onClick={installWebhooks}>
              Install
            </Button>
          </div>
        </Card>
      </div>

      <Tabs
        items={[
          {
            key: "products",
            label: "Products",
            children: (
              <div className="grid gap-4">
                {canManageCategories ? (
                  <Card
                    className="rounded-md border-[#d9dde3]"
                    size="small"
                    title="Store Categories"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="max-w-xs"
                        value={newCategoryName}
                        maxLength={80}
                        placeholder="New category name"
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        onPressEnter={() => void createCategory()}
                      />
                      <Button
                        type="primary"
                        loading={creatingCategory}
                        disabled={!newCategoryName.trim()}
                        onClick={() => void createCategory()}
                      >
                        Create Category
                      </Button>
                    </div>
                    {categories.length ? (
                      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex min-w-0 items-center gap-2 rounded-md border border-[#d9dde3] bg-[#fafafa] p-2"
                          >
                            {editingCategoryId === category.id ? (
                              <>
                                <Input
                                  autoFocus
                                  value={editingCategoryName}
                                  maxLength={80}
                                  disabled={savingCategoryId === category.id}
                                  onChange={(event) => setEditingCategoryName(event.target.value)}
                                  onPressEnter={() => void updateCategory(category)}
                                />
                                <Button
                                  type="primary"
                                  size="small"
                                  loading={savingCategoryId === category.id}
                                  disabled={!editingCategoryName.trim()}
                                  onClick={() => void updateCategory(category)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  disabled={savingCategoryId === category.id}
                                  onClick={cancelEditingCategory}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                                  {category.name}
                                </span>
                                <Button
                                  size="small"
                                  icon={<EditOutlined />}
                                  aria-label={`Edit ${category.name}`}
                                  title={`Edit ${category.name}`}
                                  disabled={Boolean(
                                    savingCategoryId || deletingCategoryId,
                                  )}
                                  onClick={() => startEditingCategory(category)}
                                />
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  aria-label={`Delete ${category.name}`}
                                  title={`Delete ${category.name}`}
                                  loading={deletingCategoryId === category.id}
                                  disabled={Boolean(
                                    savingCategoryId ||
                                      (deletingCategoryId &&
                                        deletingCategoryId !== category.id),
                                  )}
                                  onClick={() => confirmDeleteCategory(category)}
                                />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Card>
                ) : null}
                <Card
                  className="rounded-md border-[#d9dde3]"
                  title="Printify Products"
                  extra={
                    <div className="flex gap-2">
                      <Button loading={loadingProducts} onClick={loadProducts}>
                        Refresh
                      </Button>
                      <Button type="primary" loading={syncingProducts} onClick={importAllProducts}>
                        Import All
                      </Button>
                    </div>
                  }
                >
                  <Table
                    rowKey="id"
                    columns={productColumns}
                    dataSource={products}
                    loading={loadingProducts}
                    scroll={{ x: canManageCategories ? 1110 : 1050 }}
                    pagination={{ pageSize: 10 }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "webhooks",
            label: "Webhooks",
            children: (
              <Card className="rounded-md border-[#d9dde3]" title="Webhook Subscriptions">
                <Table
                  rowKey="id"
                  dataSource={webhooks}
                  pagination={false}
                  columns={[
                    { title: "Topic", dataIndex: "topic", key: "topic", width: 220 },
                    { title: "URL", dataIndex: "url", key: "url" },
                  ]}
                />
              </Card>
            ),
          },
          {
            key: "catalog",
            label: "Catalog",
            children: (
              <Card
                className="rounded-md border-[#d9dde3]"
                title="Catalog Lookup"
                extra={<Button onClick={loadBlueprints}>Load Blueprints</Button>}
              >
                <div className="grid gap-3 lg:grid-cols-3">
                  <Select
                    showSearch
                    placeholder="Blueprint"
                    value={selectedBlueprint ?? undefined}
                    optionFilterProp="label"
                    onChange={loadProviders}
                    options={blueprints.map((blueprint) => ({
                      value: blueprint.id,
                      label: `${blueprint.title} / ${blueprint.brand}`,
                    }))}
                  />
                  <Select
                    showSearch
                    placeholder="Print provider"
                    value={selectedProvider ?? undefined}
                    optionFilterProp="label"
                    onChange={(value) => loadProviderPayload(value)}
                    options={providers.map((provider) => ({
                      value: provider.id,
                      label: provider.title,
                    }))}
                  />
                  <Button
                    disabled={!selectedProvider}
                    onClick={() => selectedProvider && loadProviderPayload(selectedProvider, true)}
                  >
                    Shipping
                  </Button>
                </div>
                <pre className="mt-4 max-h-[420px] overflow-auto rounded-md bg-[#111827] p-4 text-xs text-white">
                  {catalogPayload ? JSON.stringify(catalogPayload, null, 2) : ""}
                </pre>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
