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

export async function createOrder(params: {
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  giftCardCode?: string;
  items: Array<{ productId: string; quantity: number; size?: string; color?: string }>;
}) {
  await connectToDatabase();

  const products = await Product.find({
    _id: { $in: params.items.map((item) => item.productId) },
    isActive: true,
  });
  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = params.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new ApiError(404, "One or more products were not found.");
    }
    if (!product.isGiftCard && product.inventoryCount < item.quantity) {
      throw new ApiError(409, `${product.name} is out of stock.`);
    }
    return {
      productId: product._id.toString(),
      name: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      size: item.size || null,
      color: item.color || null,
    };
  });

  const subtotalCents = orderItems.reduce(
    (total, item) => total + item.unitPriceCents * item.quantity,
    0,
  );

  const order = await Order.create({
    userId: params.userId ?? null,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    items: orderItems,
    subtotalCents,
    totalCents: subtotalCents,
    giftCardCode: params.giftCardCode || null,
    status: "pending",
  });

  await queueEmail({
    template: "store-order-confirmation",
    recipient: params.email,
    payload: { orderId: order._id.toString(), totalCents: order.totalCents },
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
