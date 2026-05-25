import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

export const MENTOR_APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "approved",
  "rejected",
] as const;

const MentorApplicationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 30,
    },
    profession: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    organization: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    expertise: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]) {
          return value.length > 0 && value.length <= 8;
        },
        message: "Choose between 1 and 8 areas of expertise.",
      },
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      max: 80,
    },
    linkedInUrl: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    availability: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 160,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1200,
    },
    communicationPreferences: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    howHeard: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    whyMentor: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: MENTOR_APPLICATION_STATUSES,
      default: "pending",
      index: true,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MentorApplicationSchema.index({ status: 1, createdAt: -1 });

type MentorApplication = InferSchemaType<typeof MentorApplicationSchema>;
export type MentorApplicationDocument = HydratedDocument<MentorApplication>;
type MentorApplicationModel = Model<MentorApplication>;

const MentorApplication =
  (mongoose.models.MentorApplication as MentorApplicationModel | undefined) ||
  mongoose.model<MentorApplication, MentorApplicationModel>(
    "MentorApplication",
    MentorApplicationSchema,
  );

export default MentorApplication;
