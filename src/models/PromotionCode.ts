import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const PromotionCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 80,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    discountType: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
    },
    percentOff: {
      type: Number,
      default: null,
      min: 1,
      max: 100,
    },
    amountOffCents: {
      type: Number,
      default: null,
      min: 100,
    },
    currency: {
      type: String,
      default: "usd",
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    stripeCouponId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    stripePromotionCodeId: {
      type: String,
      trim: true,
      default: null,
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

type PromotionCode = InferSchemaType<typeof PromotionCodeSchema>;
export type PromotionCodeDocument = HydratedDocument<PromotionCode>;
type PromotionCodeModel = Model<PromotionCode>;

const PromotionCode =
  (mongoose.models.PromotionCode as PromotionCodeModel | undefined) ||
  mongoose.model<PromotionCode, PromotionCodeModel>("PromotionCode", PromotionCodeSchema);

export default PromotionCode;
