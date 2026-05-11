import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceCents: { type: Number, required: true, min: 0 },
    size: { type: String, default: null },
    color: { type: String, default: null },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    userId: { type: String, default: null, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    items: { type: [OrderItemSchema], required: true },
    subtotalCents: { type: Number, required: true, min: 0 },
    totalCents: { type: Number, required: true, min: 0 },
    giftCardCode: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentProvider: { type: String, default: "manual" },
    providerPaymentId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

type Order = InferSchemaType<typeof OrderSchema>;
export type OrderDocument = HydratedDocument<Order>;
type OrderModel = Model<Order>;

const Order =
  (mongoose.models.Order as OrderModel | undefined) ||
  mongoose.model<Order, OrderModel>("Order", OrderSchema);

export default Order;
