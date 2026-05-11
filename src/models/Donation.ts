import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const DonationSchema = new Schema(
  {
    amountCents: { type: Number, required: true, min: 100 },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true },
    dedication: { type: String, trim: true, maxlength: 300, default: null },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentProvider: { type: String, default: "manual" },
    providerPaymentId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

type Donation = InferSchemaType<typeof DonationSchema>;
export type DonationDocument = HydratedDocument<Donation>;
type DonationModel = Model<Donation>;

const Donation =
  (mongoose.models.Donation as DonationModel | undefined) ||
  mongoose.model<Donation, DonationModel>("Donation", DonationSchema);

export default Donation;
