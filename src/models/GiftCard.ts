import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const GiftCardSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, index: true },
    initialAmountCents: { type: Number, required: true, min: 100 },
    remainingAmountCents: { type: Number, required: true, min: 0 },
    recipientEmail: { type: String, lowercase: true, trim: true, default: null },
    purchaserEmail: { type: String, lowercase: true, trim: true, default: null },
    status: {
      type: String,
      enum: ["active", "redeemed", "disabled"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

type GiftCard = InferSchemaType<typeof GiftCardSchema>;
export type GiftCardDocument = HydratedDocument<GiftCard>;
type GiftCardModel = Model<GiftCard>;

const GiftCard =
  (mongoose.models.GiftCard as GiftCardModel | undefined) ||
  mongoose.model<GiftCard, GiftCardModel>("GiftCard", GiftCardSchema);

export default GiftCard;
