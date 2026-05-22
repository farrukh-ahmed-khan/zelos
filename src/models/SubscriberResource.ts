import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SUBSCRIBER_RESOURCE_TYPES = [
  "worksheet",
  "guide",
  "template",
  "image",
  "document",
  "spreadsheet",
  "presentation",
];

const SubscriberResourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000, default: null },
    resourceType: {
      type: String,
      enum: SUBSCRIBER_RESOURCE_TYPES,
      required: true,
      index: true,
    },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    s3Key: { type: String, default: null, sparse: true },
    fileName: { type: String, trim: true, default: null, maxlength: 255 },
    mimeType: { type: String, trim: true, default: null, maxlength: 180 },
    ageTrack: { type: String, required: true, trim: true, index: true },
    releaseDate: { type: Date, default: null, index: true },
    order: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

type SubscriberResource = InferSchemaType<typeof SubscriberResourceSchema>;
export type SubscriberResourceDocument = HydratedDocument<SubscriberResource>;
type SubscriberResourceModel = Model<SubscriberResource>;

const SubscriberResource =
  (mongoose.models.SubscriberResource as SubscriberResourceModel | undefined) ||
  mongoose.model<SubscriberResource, SubscriberResourceModel>(
    "SubscriberResource",
    SubscriberResourceSchema,
  );

export default SubscriberResource;
