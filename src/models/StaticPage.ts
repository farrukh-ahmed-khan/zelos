import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const StaticPageSectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    points: { type: [String], default: [] },
  },
  { _id: false },
);

const StaticPageSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      maxlength: 120,
    },
    eyebrow: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    intro: { type: String, required: true, trim: true, maxlength: 2000 },
    sections: { type: [StaticPageSectionSchema], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
    updatedBy: { type: String, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
);

type StaticPage = InferSchemaType<typeof StaticPageSchema>;
export type StaticPageDocument = HydratedDocument<StaticPage>;
type StaticPageModel = Model<StaticPage>;

const StaticPage =
  (mongoose.models.StaticPage as StaticPageModel | undefined) ||
  mongoose.model<StaticPage, StaticPageModel>("StaticPage", StaticPageSchema);

export default StaticPage;
