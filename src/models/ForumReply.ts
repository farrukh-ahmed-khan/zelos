import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const ForumReplySchema = new Schema(
  {
    threadId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
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

ForumReplySchema.index({ threadId: 1, createdAt: 1 });

type ForumReply = InferSchemaType<typeof ForumReplySchema>;
export type ForumReplyDocument = HydratedDocument<ForumReply>;
type ForumReplyModel = Model<ForumReply>;

const ForumReply =
  (mongoose.models.ForumReply as ForumReplyModel | undefined) ||
  mongoose.model<ForumReply, ForumReplyModel>("ForumReply", ForumReplySchema);

export default ForumReply;
