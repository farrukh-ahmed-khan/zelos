import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ScholarshipApplicationSchema = new Schema(
  {
    scholarshipId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    school: { type: String, required: true, trim: true, maxlength: 180 },
    fieldOfStudy: { type: String, required: true, trim: true, maxlength: 120 },
    gpa: { type: Number, min: 0, max: 4.5, default: null },
    personalStatement: { type: String, required: true, trim: true, maxlength: 5000 },
    documentUrl: { type: String, trim: true, maxlength: 2048, default: null },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "shortlisted", "finalist", "rejected", "awarded"],
      default: "submitted",
      index: true,
    },
    reviewNote: { type: String, trim: true, maxlength: 1000, default: null },
  },
  { timestamps: true, versionKey: false },
);

type ScholarshipApplication = InferSchemaType<typeof ScholarshipApplicationSchema>;
export type ScholarshipApplicationDocument = HydratedDocument<ScholarshipApplication>;
type ScholarshipApplicationModel = Model<ScholarshipApplication>;

const ScholarshipApplication =
  (mongoose.models.ScholarshipApplication as ScholarshipApplicationModel | undefined) ||
  mongoose.model<ScholarshipApplication, ScholarshipApplicationModel>(
    "ScholarshipApplication",
    ScholarshipApplicationSchema,
  );

export default ScholarshipApplication;
