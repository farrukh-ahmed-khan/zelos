import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ForumThreadSchema = new Schema(
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
      maxlength: 10000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ForumThreadSchema.index({ createdAt: -1 });

type ForumThread = InferSchemaType<typeof ForumThreadSchema>;
export type ForumThreadDocument = HydratedDocument<ForumThread>;
type ForumThreadModel = Model<ForumThread>;

const ForumThread =
  (mongoose.models.ForumThread as ForumThreadModel | undefined) ||
  mongoose.model<ForumThread, ForumThreadModel>("ForumThread", ForumThreadSchema);

export default ForumThread;
