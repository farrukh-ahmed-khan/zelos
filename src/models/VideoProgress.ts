import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const VideoProgressSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

type VideoProgress = InferSchemaType<typeof VideoProgressSchema>;
export type VideoProgressDocument = HydratedDocument<VideoProgress>;
type VideoProgressModel = Model<VideoProgress>;

const VideoProgress =
  (mongoose.models.VideoProgress as VideoProgressModel | undefined) ||
  mongoose.model<VideoProgress, VideoProgressModel>(
    "VideoProgress",
    VideoProgressSchema,
  );

export default VideoProgress;
