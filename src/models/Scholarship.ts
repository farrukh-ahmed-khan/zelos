import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ScholarshipSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    eligibility: { type: String, required: true, trim: true, maxlength: 3000 },
    field: { type: String, required: true, trim: true, maxlength: 120, index: true },
    awardAmountCents: { type: Number, required: true, min: 0 },
    targetInstitution: { type: String, trim: true, maxlength: 180, default: null },
    initialFundCents: { type: Number, default: 0, min: 0 },
    communityDonationCents: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["draft", "active", "shortlisting", "awarded", "archived"],
      default: "draft",
      index: true,
    },
    escrowConfirmedAt: { type: Date, default: null },
    managementFeePercent: { type: Number, default: 5, min: 0, max: 100 },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

type Scholarship = InferSchemaType<typeof ScholarshipSchema>;
export type ScholarshipDocument = HydratedDocument<Scholarship>;
type ScholarshipModel = Model<Scholarship>;

const Scholarship =
  (mongoose.models.Scholarship as ScholarshipModel | undefined) ||
  mongoose.model<Scholarship, ScholarshipModel>("Scholarship", ScholarshipSchema);

export default Scholarship;
