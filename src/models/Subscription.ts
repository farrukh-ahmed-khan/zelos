import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

export const SUBSCRIPTION_PLAN_TYPES = ["monthly", "annual"] as const;
export const SUBSCRIPTION_STATUSES = [
  "active",
  "expired",
  "suspended",
  "canceled",
] as const;

export type SubscriptionPlanType = (typeof SUBSCRIPTION_PLAN_TYPES)[number];
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: SUBSCRIPTION_PLAN_TYPES,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      required: true,
      default: "active",
      index: true,
    },
    billingStatus: {
      type: String,
      enum: ["active", "grace-period", "suspended", "expired"],
      required: true,
      default: "active",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "failed"],
      required: true,
      default: "paid",
      index: true,
    },
    graceEndsAt: {
      type: Date,
      default: null,
    },
    renewalEligibleAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

SubscriptionSchema.index({ userId: 1, createdAt: -1 });

type Subscription = InferSchemaType<typeof SubscriptionSchema>;
export type SubscriptionDocument = HydratedDocument<Subscription>;
type SubscriptionModel = Model<Subscription>;

const Subscription =
  (mongoose.models.Subscription as SubscriptionModel | undefined) ||
  mongoose.model<Subscription, SubscriptionModel>(
    "Subscription",
    SubscriptionSchema,
  );

export default Subscription;
