import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SchoolResourceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    resourceType: {
      type: String,
      enum: ["lesson-plan", "teacher-guide", "student-worksheet", "image", "document", "spreadsheet", "presentation"],
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    s3Key: {
      type: String,
      default: null,
      sparse: true,
    },
    fileName: {
      type: String,
      trim: true,
      default: null,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      trim: true,
      default: null,
      maxlength: 180,
    },
    audience: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      index: true,
    },
    ageTrack: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    schoolScope: {
      type: String,
      enum: ["all-schools", "specific-schools", "district"],
      required: true,
      default: "all-schools",
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
    releaseDate: {
      type: Date,
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type SchoolResource = InferSchemaType<typeof SchoolResourceSchema>;
export type SchoolResourceDocument = HydratedDocument<SchoolResource>;
type SchoolResourceModel = Model<SchoolResource>;

const SchoolResource =
  (mongoose.models.SchoolResource as SchoolResourceModel | undefined) ||
  mongoose.model<SchoolResource, SchoolResourceModel>(
    "SchoolResource",
    SchoolResourceSchema,
  );

export default SchoolResource;
