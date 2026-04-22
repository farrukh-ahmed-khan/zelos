import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const BroadcastMessageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    sentBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type BroadcastMessage = InferSchemaType<typeof BroadcastMessageSchema>;
export type BroadcastMessageDocument = HydratedDocument<BroadcastMessage>;
type BroadcastMessageModel = Model<BroadcastMessage>;

const BroadcastMessage =
  (mongoose.models.BroadcastMessage as BroadcastMessageModel | undefined) ||
  mongoose.model<BroadcastMessage, BroadcastMessageModel>(
    "BroadcastMessage",
    BroadcastMessageSchema,
  );

export default BroadcastMessage;
