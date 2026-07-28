import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const StoreCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 100, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

type StoreCategory = InferSchemaType<typeof StoreCategorySchema>;
export type StoreCategoryDocument = HydratedDocument<StoreCategory>;
type StoreCategoryModel = Model<StoreCategory>;

const StoreCategory =
  (mongoose.models.StoreCategory as StoreCategoryModel | undefined) ||
  mongoose.model<StoreCategory, StoreCategoryModel>("StoreCategory", StoreCategorySchema);

export default StoreCategory;
