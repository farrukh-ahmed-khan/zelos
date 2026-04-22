import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const EmailOutboxSchema = new Schema(
  {
    template: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      required: true,
      default: "pending",
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type EmailOutbox = InferSchemaType<typeof EmailOutboxSchema>;
export type EmailOutboxDocument = HydratedDocument<EmailOutbox>;
type EmailOutboxModel = Model<EmailOutbox>;

const EmailOutbox =
  (mongoose.models.EmailOutbox as EmailOutboxModel | undefined) ||
  mongoose.model<EmailOutbox, EmailOutboxModel>("EmailOutbox", EmailOutboxSchema);

export default EmailOutbox;
