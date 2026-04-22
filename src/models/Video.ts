import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const VideoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    ageTrack: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

VideoSchema.index({ ageTrack: 1, order: 1 }, { unique: true });

type Video = InferSchemaType<typeof VideoSchema>;
export type VideoDocument = HydratedDocument<Video>;
type VideoModel = Model<Video>;

const Video =
  (mongoose.models.Video as VideoModel | undefined) ||
  mongoose.model<Video, VideoModel>("Video", VideoSchema);

export default Video;
