import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    link: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type Notification = InferSchemaType<typeof NotificationSchema>;
export type NotificationDocument = HydratedDocument<Notification>;
type NotificationModel = Model<Notification>;

const Notification =
  (mongoose.models.Notification as NotificationModel | undefined) ||
  mongoose.model<Notification, NotificationModel>(
    "Notification",
    NotificationSchema,
  );

export default Notification;
