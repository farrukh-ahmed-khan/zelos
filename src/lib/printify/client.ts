import { ApiError } from "@/lib/http";

const PRINTIFY_API_BASE_URL = "https://api.printify.com/v1";

type PrintifyRequestOptions = RequestInit & {
  requireConfig?: boolean;
};

export type PrintifyOrderResponse = {
  id: string;
  status?: string;
  metadata?: {
    shop_order_id?: string;
    shop_order_label?: string;
  };
};

export type PrintifyOrder = PrintifyOrderResponse & {
  app_order_id?: string;
  shop_id?: number;
  line_items?: Array<{
    id: string;
    status?: string;
    metadata?: {
      external_id?: string;
      sku?: string;
      title?: string;
    };
  }>;
};

export type PrintifyPaginatedOrders = {
  current_page: number;
  data: PrintifyOrder[];
  last_page: number;
  per_page: number;
  total: number;
};

export type PrintifyShop = {
  id: number;
  title: string;
  sales_channel: string;
};

export type PrintifyProductVariant = {
  id: number;
  sku?: string;
  price: number;
  title: string;
  is_enabled?: boolean;
  is_default?: boolean;
  is_available?: boolean;
  options?: number[];
};

export type PrintifyProduct = {
  id: string;
  title: string;
  description?: string;
  visible?: boolean;
  variants?: PrintifyProductVariant[];
  options?: Array<{
    name: string;
    type?: string;
    values: Array<{ id: number; title: string }>;
  }>;
  images?: Array<{
    src: string;
    variant_ids?: number[];
    position?: string;
    is_default?: boolean;
  }>;
  blueprint_id?: number;
  print_provider_id?: number;
  updated_at?: string;
};

export type PrintifyPaginatedProducts = {
  current_page: number;
  data: PrintifyProduct[];
  last_page: number;
  per_page: number;
  total: number;
};

export type PrintifyWebhook = {
  id: string;
  topic: string;
  url: string;
  shop_id: string | number;
};

export type PrintifyExistingProductLineItem = {
  product_id?: string;
  variant_id?: number;
  sku?: string;
  quantity: number;
  external_id?: string;
};

export type PrintifyOrderPayload = {
  external_id: string;
  label?: string;
  line_items: PrintifyExistingProductLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    country: string;
    region: string;
    address1: string;
    address2?: string;
    city: string;
    zip: string;
  };
};

export function getPrintifyShopId() {
  return process.env.PRINTIFY_SHOP_ID?.trim() || "";
}

export function isPrintifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN?.trim() && getPrintifyShopId());
}

export function shouldAutoSubmitPrintifyOrders() {
  return process.env.PRINTIFY_AUTO_SUBMIT_ORDERS !== "false";
}

function getConfiguredShopPath(path: string) {
  const shopId = getPrintifyShopId();

  if (!shopId) {
    throw new ApiError(503, "Printify shop ID is not configured.");
  }

  return `/shops/${shopId}${path}`;
}

async function parsePrintifyResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getPrintifyResponseMessage(data: unknown, status: number) {
  if (typeof data !== "object" || !data) {
    return `Printify request failed with status ${status}.`;
  }

  const response = data as {
    message?: unknown;
    errors?: { reason?: unknown } | null;
  };
  const reason = response.errors?.reason;

  if (typeof reason === "string" && reason.trim()) {
    return reason.trim();
  }

  if (typeof response.message === "string" && response.message.trim()) {
    return response.message.trim();
  }

  return `Printify request failed with status ${status}.`;
}

export async function printifyRequest<T>(
  path: string,
  options: PrintifyRequestOptions = {},
): Promise<T> {
  const token = process.env.PRINTIFY_API_TOKEN?.trim();

  if (!token) {
    throw new ApiError(503, "Printify API token is not configured.");
  }

  const response = await fetch(`${PRINTIFY_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": process.env.PRINTIFY_USER_AGENT?.trim() || "Zelos/1.0 (Next.js)",
      ...(options.headers ?? {}),
    },
  });
  const data = await parsePrintifyResponse(response);

  if (!response.ok) {
    throw new ApiError(response.status, getPrintifyResponseMessage(data, response.status), data);
  }

  return data as T;
}

export async function submitPrintifyOrder(payload: PrintifyOrderPayload) {
  return printifyRequest<PrintifyOrderResponse>(getConfiguredShopPath("/orders.json"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listPrintifyOrders(page = 1, limit = 50) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });

  return printifyRequest<PrintifyPaginatedOrders>(
    getConfiguredShopPath(`/orders.json?${params.toString()}`),
  );
}

export async function getPrintifyOrder(orderId: string) {
  return printifyRequest<PrintifyOrder>(
    getConfiguredShopPath(`/orders/${encodeURIComponent(orderId)}.json`),
  );
}

export async function findPrintifyOrderByShopOrderId(shopOrderId: string) {
  let page = 1;
  let lastPage = 1;

  do {
    const response = await listPrintifyOrders(page, 50);
    lastPage = response.last_page || 1;
    const match = (response.data ?? []).find(
      (order) => order.metadata?.shop_order_id === shopOrderId,
    );

    if (match?.id) {
      return getPrintifyOrder(match.id);
    }

    page += 1;
  } while (page <= lastPage && page <= 10);

  return null;
}

export async function listPrintifyShops() {
  return printifyRequest<PrintifyShop[]>("/shops.json");
}

export async function listPrintifyProducts(page = 1, limit = 50) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });

  return printifyRequest<PrintifyPaginatedProducts>(
    getConfiguredShopPath(`/products.json?${params.toString()}`),
  );
}

export async function getPrintifyProduct(productId: string) {
  return printifyRequest<PrintifyProduct>(
    getConfiguredShopPath(`/products/${encodeURIComponent(productId)}.json`),
  );
}

export async function listPrintifyWebhooks() {
  return printifyRequest<PrintifyWebhook[]>(getConfiguredShopPath("/webhooks.json"));
}

export async function createPrintifyWebhook(params: {
  topic: string;
  url: string;
  secret?: string;
}) {
  return printifyRequest<PrintifyWebhook>(getConfiguredShopPath("/webhooks.json"), {
    method: "POST",
    body: JSON.stringify({
      topic: params.topic,
      url: params.url,
      ...(params.secret ? { secret: params.secret } : {}),
    }),
  });
}

export async function updatePrintifyWebhook(
  webhookId: string,
  params: { url: string; secret?: string },
) {
  return printifyRequest<PrintifyWebhook>(
    getConfiguredShopPath(`/webhooks/${encodeURIComponent(webhookId)}.json`),
    {
      method: "PUT",
      body: JSON.stringify({
        url: params.url,
        ...(params.secret ? { secret: params.secret } : {}),
      }),
    },
  );
}

export async function ensurePrintifyWebhooks(params: { baseUrl: string }) {
  const url = `${params.baseUrl.replace(/\/$/, "")}/api/printify/webhook`;
  const topics = [
    "product:created",
    "product:updated",
    "product:deleted",
    "order:created",
    "order:updated",
    "order:sent-to-production",
    "order:shipment:created",
    "order:shipment:delivered",
  ];
  const current = await listPrintifyWebhooks();
  const created: PrintifyWebhook[] = [];
  const updated: PrintifyWebhook[] = [];
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET?.trim() || undefined;

  for (const topic of topics) {
    const existing = current.find((webhook) => webhook.topic === topic);

    if (!existing) {
      created.push(
        await createPrintifyWebhook({
          topic,
          url,
          secret,
        }),
      );
    } else if (existing.url !== url) {
      updated.push(await updatePrintifyWebhook(existing.id, { url, secret }));
    }
  }

  return { url, topics, existing: current, created, updated };
}

export async function listPrintifyBlueprints() {
  return printifyRequest<Array<{ id: number; title: string; brand: string; model: string }>>(
    "/catalog/blueprints.json",
  );
}

export async function listPrintifyPrintProviders(blueprintId: number) {
  return printifyRequest<Array<{ id: number; title: string; location?: unknown }>>(
    `/catalog/blueprints/${blueprintId}/print_providers.json`,
  );
}

export async function listPrintifyVariants(blueprintId: number, printProviderId: number) {
  return printifyRequest<{
    variants: Array<{
      id: number;
      title: string;
      options?: Record<string, string>;
      is_available?: boolean;
    }>;
  }>(`/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`);
}

export async function listPrintifyShipping(blueprintId: number, printProviderId: number) {
  return printifyRequest<unknown>(
    `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping.json`,
  );
}
