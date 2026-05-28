import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ForumCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 80,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    order: {
      type: Number,
      default: 1,
      min: 1,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

type ForumCategory = InferSchemaType<typeof ForumCategorySchema>;
export type ForumCategoryDocument = HydratedDocument<ForumCategory>;
type ForumCategoryModel = Model<ForumCategory>;

const ForumCategory =
  (mongoose.models.ForumCategory as ForumCategoryModel | undefined) ||
  mongoose.model<ForumCategory, ForumCategoryModel>("ForumCategory", ForumCategorySchema);

export default ForumCategory;
