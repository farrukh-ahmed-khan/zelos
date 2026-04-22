import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SchoolAssignedVideoSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    videoId: {
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

SchoolAssignedVideoSchema.index({ schoolId: 1, videoId: 1 }, { unique: true });

type SchoolAssignedVideo = InferSchemaType<typeof SchoolAssignedVideoSchema>;
export type SchoolAssignedVideoDocument = HydratedDocument<SchoolAssignedVideo>;
type SchoolAssignedVideoModel = Model<SchoolAssignedVideo>;

const SchoolAssignedVideo =
  (mongoose.models.SchoolAssignedVideo as SchoolAssignedVideoModel | undefined) ||
  mongoose.model<SchoolAssignedVideo, SchoolAssignedVideoModel>(
    "SchoolAssignedVideo",
    SchoolAssignedVideoSchema,
  );

export default SchoolAssignedVideo;
