import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ScholarshipSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    eligibility: { type: String, required: true, trim: true, maxlength: 3000 },
    field: { type: String, required: true, trim: true, maxlength: 120, index: true },
    awardAmountCents: { type: Number, required: true, min: 0 },
    numberOfRecipients: { type: Number, required: true, min: 1, default: 1 },
    applicationDeadline: { type: Date, required: true, index: true },
    selectionCriteria: { type: String, required: true, trim: true, maxlength: 3000 },
    applicationRequiresDocument: { type: Boolean, default: false },
    applicationDocumentLabel: { type: String, trim: true, maxlength: 120, default: null },
    ownerName: { type: String, trim: true, maxlength: 160, default: null },
    ownerEmail: { type: String, lowercase: true, trim: true, maxlength: 180, default: null },
    status: {
      type: String,
      enum: ["draft", "active", "closed", "archived"],
      default: "draft",
      index: true,
    },
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
