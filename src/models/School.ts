import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SchoolSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
      unique: true,
    },
    teacherLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    studentLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    teachersCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    studentsCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    licenseStatus: {
      type: String,
      enum: ["active", "expired", "suspended"],
      required: true,
      default: "active",
      index: true,
    },
    licenseStartsAt: {
      type: Date,
      default: () => new Date(),
    },
    licenseExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    assignedTracks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

type School = InferSchemaType<typeof SchoolSchema>;
export type SchoolDocument = HydratedDocument<School>;
type SchoolModel = Model<School>;

const School =
  (mongoose.models.School as SchoolModel | undefined) ||
  mongoose.model<School, SchoolModel>("School", SchoolSchema);

export default School;
