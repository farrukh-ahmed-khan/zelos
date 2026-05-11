import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ContentCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    ageTrack: { type: String, required: true, trim: true, index: true },
    audience: {
      type: String,
      enum: ["subscriber", "teacher", "student", "public-preview"],
      required: true,
      default: "subscriber",
      index: true,
    },
    order: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

ContentCategorySchema.index({ name: 1, ageTrack: 1, audience: 1 }, { unique: true });

type ContentCategory = InferSchemaType<typeof ContentCategorySchema>;
export type ContentCategoryDocument = HydratedDocument<ContentCategory>;
type ContentCategoryModel = Model<ContentCategory>;

const ContentCategory =
  (mongoose.models.ContentCategory as ContentCategoryModel | undefined) ||
  mongoose.model<ContentCategory, ContentCategoryModel>(
    "ContentCategory",
    ContentCategorySchema,
  );

export default ContentCategory;
