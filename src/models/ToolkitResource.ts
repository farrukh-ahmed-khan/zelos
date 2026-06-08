import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ToolkitResourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000, default: null },
    resourceType: {
      type: String,
      enum: ["worksheet", "quiz", "budget-template", "goal-setting", "family-prompt"],
      required: true,
      index: true,
    },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    s3Key: { type: String, default: null, sparse: true },
    fileName: { type: String, trim: true, maxlength: 255, default: null },
    mimeType: { type: String, trim: true, maxlength: 120, default: null },
    linkedVideoId: { type: String, default: null, index: true },
    ageTrack: { type: String, required: true, trim: true, index: true },
    order: { type: Number, min: 1, default: 1 },
    answers: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

ToolkitResourceSchema.index({ ageTrack: 1, order: 1 });

type ToolkitResource = InferSchemaType<typeof ToolkitResourceSchema>;
export type ToolkitResourceDocument = HydratedDocument<ToolkitResource>;
type ToolkitResourceModel = Model<ToolkitResource>;

const ToolkitResource =
  (mongoose.models.ToolkitResource as ToolkitResourceModel | undefined) ||
  mongoose.model<ToolkitResource, ToolkitResourceModel>(
    "ToolkitResource",
    ToolkitResourceSchema,
  );

export default ToolkitResource;
