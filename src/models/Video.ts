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
    audience: {
      type: String,
      enum: ["subscriber", "teacher", "student", "public-preview"],
      required: true,
      default: "subscriber",
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
      trim: true,
      maxlength: 120,
      index: true,
    },
    playlist: {
      type: String,
      required: true,
      default: "General",
      trim: true,
      maxlength: 120,
      index: true,
    },
    schoolScope: {
      type: String,
      enum: ["global", "all-schools", "specific-schools", "district"],
      required: true,
      default: "global",
      index: true,
    },
    schoolIds: {
      type: [String],
      default: [],
      index: true,
    },
    district: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    releaseDate: {
      type: Date,
      default: null,
      index: true,
    },
    dripEnabled: {
      type: Boolean,
      default: true,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
      index: true,
    },
    isMissionVideo: {
      type: Boolean,
      default: false,
      index: true,
    },
    s3Key: {
      type: String,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

VideoSchema.index({ audience: 1, ageTrack: 1, schoolScope: 1, order: 1 });

type Video = InferSchemaType<typeof VideoSchema>;
export type VideoDocument = HydratedDocument<Video>;
type VideoModel = Model<Video>;

const Video =
  (mongoose.models.Video as VideoModel | undefined) ||
  mongoose.model<Video, VideoModel>("Video", VideoSchema);

export default Video;
