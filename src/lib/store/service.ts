import { randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import Product, { type ProductDocument } from "@/models/Product";
import Order, { type OrderDocument } from "@/models/Order";
import GiftCard from "@/models/GiftCard";
import {
  getPrintifyShopId,
  getPrintifyProduct,
  findPrintifyOrderByShopOrderId,
  isPrintifyConfigured,
  listPrintifyProducts,
  shouldAutoSubmitPrintifyOrders,
  submitPrintifyOrder,
  type PrintifyProduct,
  type PrintifyProductVariant,
  type PrintifyExistingProductLineItem,
} from "@/lib/printify/client";

export function serializeProduct(product: ProductDocument) {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceCents: product.priceCents,
    images: product.images ?? [],
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    variants: (product.variants ?? []).map((variant) => ({
      sku: variant.sku ?? null,
      size: variant.size ?? null,
      color: variant.color ?? null,
      printifyVariantId: variant.printifyVariantId ?? null,
      imageUrl: variant.imageUrl ?? null,
      inventoryCount: variant.inventoryCount,
      priceAdjustmentCents: variant.priceAdjustmentCents ?? 0,
      isActive: variant.isActive,
    })),
    inventoryCount: product.inventoryCount,
    limitedEdition: product.limitedEdition,
    isActive: product.isActive,
    isGiftCard: product.isGiftCard,
    printify: {
      enabled: product.printify?.enabled ?? false,
      productId: product.printify?.productId ?? null,
      defaultVariantId: product.printify?.defaultVariantId ?? null,
    },
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };
}

export async function getProducts(includeInactive = false) {
  await connectToDatabase();
  return Product.find(includeInactive ? {} : { isActive: true }).sort({ createdAt: -1 });
}

export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  return Product.findOne({ slug, isActive: true });
}

export async function createProduct(params: Record<string, unknown>) {
  await connectToDatabase();
  return Product.create(params);
}

export async function updateProduct(productId: string, params: Record<string, unknown>) {
  await connectToDatabase();

  const product = await Product.findByIdAndUpdate(productId, params, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
}

export async function deleteProduct(productId: string) {
  await connectToDatabase();

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
}

function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function getPrintifyOptionValue(product: PrintifyProduct, variant: PrintifyProductVariant, type: string) {
  const optionIds = new Set(variant.options ?? []);

  for (const option of product.options ?? []) {
    const optionName = `${option.type ?? ""} ${option.name}`.toLowerCase();

    if (!optionName.includes(type)) {
      continue;
    }

    const value = option.values.find((entry) => optionIds.has(entry.id));

    if (value) {
      return value.title;
    }
  }

  return "";
}

async function uniqueProductSlug(title: string, printifyProductId: string) {
  const baseSlug = slugifyProductName(title) || `printify-${printifyProductId.slice(-8)}`;
  const existingPrintifyProduct = await Product.findOne({
    "printify.productId": printifyProductId,
  });

  if (existingPrintifyProduct) {
    return existingPrintifyProduct.slug;
  }

  const existingSlug = await Product.findOne({ slug: baseSlug });

  if (!existingSlug) {
    return baseSlug;
  }

  return `${baseSlug}-${printifyProductId.slice(-6).toLowerCase()}`;
}

function mapPrintifyProductToLocalPayload(product: PrintifyProduct, slug: string) {
  const enabledVariants = (product.variants ?? []).filter((variant) => variant.is_enabled !== false);
  const imageForVariant = new Map<number, string>();

  for (const image of product.images ?? []) {
    for (const variantId of image.variant_ids ?? []) {
      if (!imageForVariant.has(variantId)) {
        imageForVariant.set(variantId, image.src);
      }
    }
  }

  const variants = enabledVariants.map((variant) => {
    const titleParts = variant.title.split("/").map((part) => part.trim());
    const size = getPrintifyOptionValue(product, variant, "size") || titleParts[1] || titleParts[0] || "";
    const color = getPrintifyOptionValue(product, variant, "color") || titleParts[0] || "";

    return {
      sku: variant.sku ?? "",
      size,
      color,
      printifyVariantId: variant.id,
      imageUrl: imageForVariant.get(variant.id) ?? null,
      inventoryCount: variant.is_available === false ? 0 : 9999,
      priceAdjustmentCents: variant.price - Math.min(...enabledVariants.map((entry) => entry.price)),
      isActive: variant.is_available !== false,
    };
  });
  const defaultVariant =
    enabledVariants.find((variant) => variant.is_default) ?? enabledVariants[0] ?? product.variants?.[0];
  const images = [...(product.images ?? [])]
    .sort((a, b) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default)))
    .map((image) => image.src)
    .filter(Boolean)
    .slice(0, 12);
  const sizes = Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean)));
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean)));
  const priceCents = enabledVariants.length
    ? Math.min(...enabledVariants.map((variant) => variant.price))
    : defaultVariant?.price ?? 0;

  return {
    name: product.title,
    slug,
    description: product.description || product.title,
    priceCents,
    images,
    sizes,
    colors,
    variants,
    inventoryCount: variants.reduce((total, variant) => total + variant.inventoryCount, 0),
    limitedEdition: false,
    isActive: product.visible !== false && variants.some((variant) => variant.isActive),
    isGiftCard: false,
    printify: {
      enabled: true,
      productId: product.id,
      defaultVariantId: defaultVariant?.id ?? null,
    },
  };
}

export async function importPrintifyProduct(productId: string) {
  await connectToDatabase();

  const printifyProduct = await getPrintifyProduct(productId);
  const slug = await uniqueProductSlug(printifyProduct.title, printifyProduct.id);
  const payload = mapPrintifyProductToLocalPayload(printifyProduct, slug);
  const product = await Product.findOneAndUpdate(
    { "printify.productId": printifyProduct.id },
    { $set: payload },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return product;
}

export async function importAllPrintifyProducts() {
  await connectToDatabase();

  const imported = [];
  const importedPrintifyProductIds: string[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await listPrintifyProducts(page, 50);
    lastPage = response.last_page || 1;

    for (const printifyProduct of response.data ?? []) {
      importedPrintifyProductIds.push(printifyProduct.id);
      const slug = await uniqueProductSlug(printifyProduct.title, printifyProduct.id);
      const payload = mapPrintifyProductToLocalPayload(printifyProduct, slug);
      const product = await Product.findOneAndUpdate(
        { "printify.productId": printifyProduct.id },
        { $set: payload },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
      imported.push(product);
    }

    page += 1;
  } while (page <= lastPage);

  await Product.updateMany(
    {
      "printify.enabled": true,
      "printify.productId": { $nin: importedPrintifyProductIds },
    },
    {
      $set: {
        isActive: false,
        "printify.enabled": false,
      },
    },
  );

  return imported;
}

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
};

export async function createOrder(params: {
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  giftCardCode?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    giftCardAmountCents?: number;
  }>;
}) {
  await connectToDatabase();

  const realProductIds = params.items
    .filter((item) => item.productId !== "__gift_card__")
    .map((item) => item.productId);
  const products = await Product.find({
    _id: { $in: realProductIds },
    isActive: true,
  });
  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = params.items.map((item) => {
    if (item.productId === "__gift_card__") {
      if (!item.giftCardAmountCents || item.giftCardAmountCents < 100) {
        throw new ApiError(422, "Gift card amount is invalid.");
      }

      return {
        productId: item.productId,
        name: "Zelos Gift Card",
        quantity: item.quantity,
        unitPriceCents: item.giftCardAmountCents,
        size: null,
        color: null,
      };
    }

    const product = productById.get(item.productId);
    if (!product) {
      throw new ApiError(404, "One or more products were not found.");
    }
    const variant = product.variants?.find(
      (entry) =>
        (entry.size ?? "") === (item.size ?? "") &&
        (entry.color ?? "") === (item.color ?? "") &&
        entry.isActive !== false,
    );

    if (!product.isGiftCard && product.variants?.length && !variant) {
      throw new ApiError(404, `${product.name} variation was not found.`);
    }

    if (!product.isGiftCard && variant && variant.inventoryCount < item.quantity) {
      throw new ApiError(409, `${product.name} variation is out of stock.`);
    }

    if (!product.isGiftCard && !variant && product.inventoryCount < item.quantity) {
      throw new ApiError(409, `${product.name} is out of stock.`);
    }
    return {
      productId: product._id.toString(),
      name: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents + (variant?.priceAdjustmentCents ?? 0),
      size: item.size || null,
      color: item.color || null,
      printifyProductId:
        product.printify?.enabled && product.printify.productId ? product.printify.productId : null,
      printifyVariantId:
        product.printify?.enabled
          ? (variant?.printifyVariantId ?? product.printify.defaultVariantId ?? null)
          : null,
      printifySku: product.printify?.enabled && variant?.sku ? variant.sku : null,
    };
  });

  const subtotalCents = orderItems.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );
  let giftCardAppliedCents = 0;
  let giftCardCode: string | null = null;

  if (params.giftCardCode) {
    const giftCard = await GiftCard.findOne({
      code: params.giftCardCode.trim().toUpperCase(),
      status: "active",
    });

    if (!giftCard || giftCard.remainingAmountCents <= 0) {
      throw new ApiError(422, "Gift card is invalid or has no remaining balance.");
    }

    giftCardAppliedCents = Math.min(giftCard.remainingAmountCents, subtotalCents);
    giftCardCode = giftCard.code;
  }

  const totalCents = Math.max(0, subtotalCents - giftCardAppliedCents);
  const hasPrintifyItems = orderItems.some(
    (item) => Boolean(item.printifySku) || Boolean(item.printifyProductId),
  );

  const order = await Order.create({
    userId: params.userId ?? null,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    items: orderItems,
    subtotalCents,
    discountCents: giftCardAppliedCents,
    totalCents,
    paidCents: 0,
    giftCardCode,
    giftCardAppliedCents,
    status: "pending",
    shippingAddress: params.shippingAddress ?? null,
    billingAddress: params.billingAddress ?? params.shippingAddress ?? null,
    printify: {
      shopId: getPrintifyShopId() || null,
      syncStatus: hasPrintifyItems ? "pending" : "not_applicable",
    },
  });

  return order;
}

export async function markOrderPaid(params: {
  orderId: string;
  providerPaymentId?: string | null;
  stripeCheckoutSessionId?: string | null;
}) {
  await connectToDatabase();

  const order = await Order.findById(params.orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.status !== "pending") {
    if (
      shouldAutoSubmitPrintifyOrders() &&
      isPrintifyConfigured() &&
      ["paid", "processing"].includes(order.status) &&
      order.printify?.syncStatus === "pending"
    ) {
      try {
        await submitPaidOrderToPrintify(order._id.toString());
      } catch (error) {
        console.error("Printify order submission failed:", error);
      }
    }

    return order;
  }

  for (const item of order.items) {
    if (item.productId === "__gift_card__") {
      continue;
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(404, `Product not found: ${item.name}`);
    }

    if (!product.isGiftCard) {
      const variantIndex = product.variants?.findIndex(
        (entry) =>
          (entry.size ?? "") === (item.size ?? "") &&
          (entry.color ?? "") === (item.color ?? "") &&
          entry.isActive !== false,
      );

      if (variantIndex !== undefined && variantIndex >= 0) {
        const variant = product.variants[variantIndex];

        if (variant.inventoryCount < item.quantity) {
          throw new ApiError(409, `${product.name} variation is out of stock.`);
        }

        variant.inventoryCount -= item.quantity;
        product.inventoryCount = Math.max(0, product.inventoryCount - item.quantity);
        await product.save();
        continue;
      }

      if (product.inventoryCount < item.quantity) {
        throw new ApiError(409, `${product.name} is out of stock.`);
      }

      product.inventoryCount -= item.quantity;
      await product.save();
    }
  }

  if (order.giftCardCode && order.giftCardAppliedCents > 0) {
    const giftCard = await GiftCard.findOne({ code: order.giftCardCode });

    if (giftCard) {
      giftCard.remainingAmountCents = Math.max(
        0,
        giftCard.remainingAmountCents - order.giftCardAppliedCents,
      );
      giftCard.status = giftCard.remainingAmountCents > 0 ? "active" : "redeemed";
      await giftCard.save();
    }
  }

  const giftCardItems = order.items.filter((item) => item.name.toLowerCase().includes("gift card"));

  for (const item of giftCardItems) {
    for (let index = 0; index < item.quantity; index += 1) {
      await createGiftCard({
        amountCents: item.unitPriceCents,
        recipientEmail: order.email,
        purchaserEmail: order.email,
      });
    }
  }

  order.status = "paid";
  order.paidCents = order.totalCents;
  order.providerPaymentId = params.providerPaymentId ?? order.providerPaymentId;
  order.stripeCheckoutSessionId =
    params.stripeCheckoutSessionId ?? order.stripeCheckoutSessionId;
  order.paidAt = new Date();
  await order.save();

  await queueEmail({
    template: "swag-order-confirmation",
    recipient: order.email,
    payload: { orderId: order._id.toString(), totalCents: order.totalCents },
  });

  if (
    shouldAutoSubmitPrintifyOrders() &&
    isPrintifyConfigured() &&
    order.printify?.syncStatus === "pending"
  ) {
    try {
      await submitPaidOrderToPrintify(order._id.toString());
    } catch (error) {
      console.error("Printify order submission failed:", error);
    }
  }

  return order;
}

export async function submitPendingPrintifyOrders(limit = 25) {
  await connectToDatabase();

  if (!shouldAutoSubmitPrintifyOrders() || !isPrintifyConfigured()) {
    return { attempted: 0, submitted: 0, failed: 0 };
  }

  const orders = await Order.find({
    status: { $in: ["paid", "processing"] },
    "printify.syncStatus": "pending",
  })
    .sort({ createdAt: 1 })
    .limit(limit);
  let submitted = 0;
  let failed = 0;

  for (const order of orders) {
    try {
      await submitPaidOrderToPrintify(order._id.toString());
      submitted += 1;
    } catch (error) {
      failed += 1;
      console.error("Pending Printify order submission failed:", error);
    }
  }

  return { attempted: orders.length, submitted, failed };
}

export async function updateOrderStatus(params: {
  orderId: string;
  status: "paid" | "processing" | "shipped" | "delivered" | "cancelled";
}) {
  await connectToDatabase();

  const order = await Order.findByIdAndUpdate(
    params.orderId,
    { $set: { status: params.status } },
    { new: true, runValidators: true },
  );

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  await queueEmail({
    template: "swag-order-status-update",
    recipient: order.email,
    payload: {
      orderId: order._id.toString(),
      status: order.status,
      totalCents: order.totalCents,
    },
  });

  return order;
}

function normalizeCountryCode(country?: string | null) {
  const value = (country || "US").trim();
  const normalized = value.toLowerCase();

  if (value.length === 2) {
    return value.toUpperCase();
  }

  if (["united states", "usa", "u.s.", "u.s.a."].includes(normalized)) {
    return "US";
  }

  return value;
}

function getPrintifyErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Printify submission failed.";
}

function mapPrintifyOrderStatus(status?: string | null) {
  if (!status) {
    return null;
  }

  if (["fulfilled", "delivered"].includes(status)) {
    return "delivered";
  }

  if (["canceled", "cancelled"].includes(status)) {
    return "cancelled";
  }

  if (["in-production", "sending-to-production", "on-hold", "has-issues"].includes(status)) {
    return "processing";
  }

  return null;
}

async function attachExistingPrintifyOrder(order: OrderDocument) {
  const existing = await findPrintifyOrderByShopOrderId(order._id.toString());

  if (!existing?.id) {
    return null;
  }

  order.status = mapPrintifyOrderStatus(existing.status) ?? "processing";
  order.printify = {
    ...(order.printify ?? {}),
    orderId: existing.id,
    shopId: existing.shop_id ? String(existing.shop_id) : getPrintifyShopId() || null,
    status: existing.status ?? order.printify?.status ?? null,
    syncStatus: "submitted",
    syncError: null,
    submittedAt: order.printify?.submittedAt ?? new Date(),
    lastSyncedAt: new Date(),
  };
  await order.save();
  return order;
}

async function getCurrentPrintifyProducts() {
  const products: PrintifyProduct[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await listPrintifyProducts(page, 50);
    products.push(...(response.data ?? []));
    lastPage = response.last_page || 1;
    page += 1;
  } while (page <= lastPage);

  return products;
}

function isOrderablePrintifyVariant(variant: PrintifyProductVariant) {
  return variant.is_enabled !== false && variant.is_available !== false;
}

async function resolvePrintifyLineItems(order: OrderDocument) {
  const fulfillmentItems = order.items.filter(
    (item) => item.printifyProductId || item.printifyVariantId || item.printifySku,
  );

  if (!fulfillmentItems.length) {
    return [];
  }

  const products = await getCurrentPrintifyProducts();
  const productsById = new Map(products.map((product) => [product.id, product]));
  const variantsBySku = new Map<
    string,
    Array<{ product: PrintifyProduct; variant: PrintifyProductVariant }>
  >();

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      if (!variant.sku || !isOrderablePrintifyVariant(variant)) {
        continue;
      }

      const matches = variantsBySku.get(variant.sku) ?? [];
      matches.push({ product, variant });
      variantsBySku.set(variant.sku, matches);
    }
  }

  const lineItems: PrintifyExistingProductLineItem[] = [];

  for (const [index, item] of order.items.entries()) {
    if (!item.printifyProductId && !item.printifyVariantId && !item.printifySku) {
      continue;
    }

    const product = item.printifyProductId
      ? productsById.get(item.printifyProductId)
      : undefined;
    const variant = product?.variants?.find(
      (entry) =>
        entry.id === item.printifyVariantId && isOrderablePrintifyVariant(entry),
    );
    const externalId = `${order._id.toString()}-${index}`;

    if (product && variant) {
      lineItems.push({
        product_id: product.id,
        variant_id: variant.id,
        quantity: item.quantity,
        external_id: externalId,
      });
      continue;
    }

    const skuMatches = item.printifySku ? variantsBySku.get(item.printifySku) ?? [] : [];

    if (skuMatches.length === 1 && item.printifySku) {
      const [match] = skuMatches;
      item.printifyProductId = match.product.id;
      item.printifyVariantId = match.variant.id;
      lineItems.push({
        sku: item.printifySku,
        quantity: item.quantity,
        external_id: externalId,
      });
      continue;
    }

    const options = [item.size, item.color].filter(Boolean).join(" / ");
    const itemLabel = options ? `${item.name} (${options})` : item.name;
    const shopId = getPrintifyShopId();
    const reason = skuMatches.length > 1
      ? `SKU ${item.printifySku} matches multiple variants in Printify shop ${shopId}.`
      : `Its saved product${item.printifyProductId ? ` ${item.printifyProductId}` : ""}${
          item.printifySku ? ` and SKU ${item.printifySku}` : ""
        } no longer exist as an orderable variant in Printify shop ${shopId}.`;

    throw new ApiError(
      409,
      `Cannot send ${itemLabel} to Printify. ${reason} Restore the variant or assign the saved SKU to its replacement in Printify, sync the catalog, and retry.`,
    );
  }

  return lineItems;
}

export async function submitPaidOrderToPrintify(orderId: string) {
  await connectToDatabase();

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (order.status === "pending") {
    throw new ApiError(409, "Order must be paid before it can be sent to Printify.");
  }

  if (order.status === "cancelled") {
    throw new ApiError(409, "Cancelled orders cannot be sent to Printify.");
  }

  if (order.printify?.syncStatus === "submitted" && order.printify.orderId) {
    return order;
  }

  const existingPrintifyOrder = await attachExistingPrintifyOrder(order);

  if (existingPrintifyOrder) {
    return existingPrintifyOrder;
  }

  let lineItems: PrintifyExistingProductLineItem[];

  try {
    lineItems = await resolvePrintifyLineItems(order);
  } catch (error) {
    order.printify = {
      ...(order.printify ?? {}),
      syncStatus: "failed",
      syncError: getPrintifyErrorMessage(error),
      lastSyncedAt: new Date(),
    };
    await order.save();
    throw error;
  }

  if (!lineItems.length) {
    order.printify = {
      ...(order.printify ?? {}),
      syncStatus: "not_applicable",
      syncError: null,
      lastSyncedAt: new Date(),
    };
    await order.save();
    return order;
  }

  if (!order.shippingAddress) {
    order.printify = {
      ...(order.printify ?? {}),
      syncStatus: "failed",
      syncError: "Printify fulfillment requires a shipping address.",
      lastSyncedAt: new Date(),
    };
    await order.save();
    throw new ApiError(422, "Printify fulfillment requires a shipping address.");
  }

  try {
    const response = await submitPrintifyOrder({
      external_id: order._id.toString(),
      label: `Zelos ${order._id.toString().slice(-8).toUpperCase()}`,
      line_items: lineItems,
      shipping_method: Number(process.env.PRINTIFY_SHIPPING_METHOD ?? 1),
      send_shipping_notification: process.env.PRINTIFY_SEND_SHIPPING_NOTIFICATION === "true",
      address_to: {
        first_name: order.firstName,
        last_name: order.lastName,
        email: order.email,
        country: normalizeCountryCode(order.shippingAddress.country),
        region: order.shippingAddress.state,
        address1: order.shippingAddress.line1,
        address2: order.shippingAddress.line2 ?? "",
        city: order.shippingAddress.city,
        zip: order.shippingAddress.zip,
      },
    });

    order.status = "processing";
    order.printify = {
      ...(order.printify ?? {}),
      orderId: response.id,
      shopId: getPrintifyShopId() || order.printify?.shopId || null,
      syncStatus: "submitted",
      syncError: null,
      submittedAt: new Date(),
      lastSyncedAt: new Date(),
    };
    await order.save();
    return order;
  } catch (error) {
    const existingAfterError = await attachExistingPrintifyOrder(order);

    if (existingAfterError) {
      return existingAfterError;
    }

    order.printify = {
      ...(order.printify ?? {}),
      syncStatus: "failed",
      syncError: getPrintifyErrorMessage(error),
      lastSyncedAt: new Date(),
    };
    await order.save();
    throw error;
  }
}

export async function applyPrintifyWebhookEvent(event: {
  id?: string;
  type?: string;
  created_at?: string;
  resource?: {
    id?: string;
    type?: string;
    data?: {
      shop_id?: number | string;
      status?: string;
      shipped_at?: string;
      delivered_at?: string;
      carrier?: {
        code?: string;
        tracking_number?: string;
        tracking_url?: string;
      };
    } | null;
  };
}) {
  await connectToDatabase();

  if (event.resource?.type === "product" && event.resource.id) {
    if (event.type === "product:deleted") {
      return Product.findOneAndUpdate(
        { "printify.productId": event.resource.id },
        {
          $set: {
            isActive: false,
            "printify.enabled": false,
          },
        },
        { new: true },
      );
    }

    if (["product:created", "product:updated"].includes(event.type ?? "")) {
      return importPrintifyProduct(event.resource.id);
    }
  }

  const printifyOrderId = event.resource?.type === "order" ? event.resource.id : null;

  if (!printifyOrderId) {
    return null;
  }

  const order = await Order.findOne({ "printify.orderId": printifyOrderId });

  if (!order) {
    return null;
  }

  const data = event.resource?.data ?? {};
  const now = new Date();
  const nextStatus =
    event.type === "order:shipment:created"
      ? "shipped"
      : event.type === "order:shipment:delivered"
        ? "delivered"
        : mapPrintifyOrderStatus(data.status);

  if (nextStatus) {
    order.status = nextStatus;
  }

  const carrier = data.carrier;

  if (carrier?.tracking_number || carrier?.tracking_url) {
    const existingShipment = order.printify?.shipments?.find(
      (shipment) =>
        shipment.number &&
        carrier.tracking_number &&
        shipment.number === carrier.tracking_number,
    );

    if (existingShipment) {
      existingShipment.carrier = carrier.code ?? existingShipment.carrier ?? null;
      existingShipment.url = carrier.tracking_url ?? existingShipment.url ?? null;
      existingShipment.deliveredAt = data.delivered_at
        ? new Date(data.delivered_at)
        : existingShipment.deliveredAt ?? null;
    } else {
      order.set("printify.shipments", [
        ...((order.printify?.shipments ?? []).map((shipment) => ({
          carrier: shipment.carrier ?? null,
          number: shipment.number ?? null,
          url: shipment.url ?? null,
          deliveredAt: shipment.deliveredAt ?? null,
        })) as Array<{
          carrier: string | null;
          number: string | null;
          url: string | null;
          deliveredAt: Date | null;
        }>),
        {
          carrier: carrier.code ?? null,
          number: carrier.tracking_number ?? null,
          url: carrier.tracking_url ?? null,
          deliveredAt: data.delivered_at ? new Date(data.delivered_at) : null,
        },
      ]);
    }
  }

  order.printify = {
    ...(order.printify ?? {}),
    status: data.status ?? order.printify?.status ?? null,
    shopId: data.shop_id ? String(data.shop_id) : order.printify?.shopId ?? null,
    syncStatus: "submitted",
    syncError: null,
    lastEventId: event.id ?? order.printify?.lastEventId ?? null,
    lastSyncedAt: now,
  };
  await order.save();
  return order;
}

export async function createGiftCard(params: {
  amountCents: number;
  recipientEmail?: string;
  purchaserEmail?: string;
}) {
  await connectToDatabase();
  const code = `ZELOS-${randomBytes(4).toString("hex").toUpperCase()}`;
  const giftCard = await GiftCard.create({
    code,
    initialAmountCents: params.amountCents,
    remainingAmountCents: params.amountCents,
    recipientEmail: params.recipientEmail || null,
    purchaserEmail: params.purchaserEmail || null,
  });
  if (params.recipientEmail) {
    await queueEmail({
      template: "gift-card-delivery",
      recipient: params.recipientEmail,
      payload: { code, amountCents: params.amountCents },
    });
  }
  return giftCard;
}
