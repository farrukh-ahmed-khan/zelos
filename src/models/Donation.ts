import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const DonationSchema = new Schema(
  {
    amountCents: { type: Number, required: true, min: 100 },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    dedication: { type: String, trim: true, maxlength: 300, default: null },
    purpose: {
      type: String,
      enum: ["general", "scholarship"],
      default: "general",
      index: true,
    },
    scholarshipId: { type: String, default: null, index: true },
    scholarshipName: { type: String, trim: true, maxlength: 180, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentProvider: { type: String, default: "stripe" },
    providerPaymentId: { type: String, default: null },
    receiptUrl: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

DonationSchema.index({ scholarshipId: 1, status: 1, createdAt: -1 });

type Donation = InferSchemaType<typeof DonationSchema>;
export type DonationDocument = HydratedDocument<Donation>;
type DonationModel = Model<Donation>;

const Donation =
  (mongoose.models.Donation as DonationModel | undefined) ||
  mongoose.model<Donation, DonationModel>("Donation", DonationSchema);

export default Donation;
