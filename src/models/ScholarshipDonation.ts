import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ScholarshipDonationSchema = new Schema(
  {
    scholarshipId: { type: String, required: true, index: true },
    amountCents: { type: Number, required: true, min: 100 },
    donorName: { type: String, required: true, trim: true, maxlength: 120 },
    donorEmail: { type: String, required: true, lowercase: true, trim: true },
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

type ScholarshipDonation = InferSchemaType<typeof ScholarshipDonationSchema>;
export type ScholarshipDonationDocument = HydratedDocument<ScholarshipDonation>;
type ScholarshipDonationModel = Model<ScholarshipDonation>;

const ScholarshipDonation =
  (mongoose.models.ScholarshipDonation as ScholarshipDonationModel | undefined) ||
  mongoose.model<ScholarshipDonation, ScholarshipDonationModel>(
    "ScholarshipDonation",
    ScholarshipDonationSchema,
  );

export default ScholarshipDonation;
