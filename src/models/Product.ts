import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ProductVariantSchema = new Schema(
  {
    sku: { type: String, trim: true, maxlength: 80, default: null },
    size: { type: String, trim: true, maxlength: 30, default: null },
    color: { type: String, trim: true, maxlength: 40, default: null },
    inventoryCount: { type: Number, required: true, default: 0, min: 0 },
    priceAdjustmentCents: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    priceCents: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    inventoryCount: { type: Number, required: true, default: 0, min: 0 },
    limitedEdition: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isGiftCard: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

type Product = InferSchemaType<typeof ProductSchema>;
export type ProductDocument = HydratedDocument<Product>;
type ProductModel = Model<Product>;

const Product =
  (mongoose.models.Product as ProductModel | undefined) ||
  mongoose.model<Product, ProductModel>("Product", ProductSchema);

export default Product;
