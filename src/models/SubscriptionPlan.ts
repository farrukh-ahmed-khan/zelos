import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SubscriptionPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    interval: {
      type: String,
      enum: ["monthly", "annual"],
      required: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ["individual", "family"],
      required: true,
      index: true,
    },
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    ageTrack: {
      type: String,
      trim: true,
      default: null,
    },
    stripePriceId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    discountBadge: {
      type: String,
      trim: true,
      maxlength: 80,
      default: null,
    },
    isPromotional: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

SubscriptionPlanSchema.index(
  { interval: 1, accountType: 1, ageTrack: 1, isActive: 1 },
  { name: "plan_lookup_idx" },
);

type SubscriptionPlan = InferSchemaType<typeof SubscriptionPlanSchema>;
export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>;
type SubscriptionPlanModel = Model<SubscriptionPlan>;

const SubscriptionPlan =
  (mongoose.models.SubscriptionPlan as SubscriptionPlanModel | undefined) ||
  mongoose.model<SubscriptionPlan, SubscriptionPlanModel>(
    "SubscriptionPlan",
    SubscriptionPlanSchema,
  );

export default SubscriptionPlan;
