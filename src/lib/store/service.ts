import { randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import Product, { type ProductDocument } from "@/models/Product";
import Order from "@/models/Order";
import GiftCard from "@/models/GiftCard";

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
    variants: product.variants ?? [],
    inventoryCount: product.inventoryCount,
    limitedEdition: product.limitedEdition,
    isActive: product.isActive,
    isGiftCard: product.isGiftCard,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
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

export async function createOrder(params: {
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  giftCardCode?: string;
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

  return order;
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
