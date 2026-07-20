"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Select, Table, Tabs, Tag, message as antMessage } from "antd";
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
  visible?: boolean;
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

function money(cents: number) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function AdminPrintifyManager() {
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

  async function importProduct(productId: string) {
    setImportingId(productId);
    try {
      const response = await api.post("/api/admin/printify/products", { productId });
      const result = response.data;

      if (!isApiSuccess(response.status)) {
        antMessage.error(result?.error?.message ?? "Unable to import product.");
        return;
      }

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
      void loadStatus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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
      title: "API Status",
      key: "status",
      width: 120,
      render: (_, product) => (
        <Tag color={product.visible === false ? "default" : "green"}>
          {product.visible === false ? "HIDDEN" : "IMPORTABLE"}
        </Tag>
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
          Import
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
              <Card
                className="rounded-md border-[#d9dde3]"
                title="Printify Products"
                extra={
                  <div className="flex gap-2">
                    <Button loading={loadingProducts} onClick={loadProducts}>
                      Load
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
                  scroll={{ x: 900 }}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
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
