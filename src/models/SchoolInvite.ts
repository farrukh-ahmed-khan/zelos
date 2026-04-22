import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const SchoolInviteSchema = new Schema(
  {
    schoolId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    invitedBy: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    usedAt: {
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

SchoolInviteSchema.index(
  { schoolId: 1, email: 1, role: 1, used: 1 },
  { name: "school_email_role_status_idx" },
);

type SchoolInvite = InferSchemaType<typeof SchoolInviteSchema>;
export type SchoolInviteDocument = HydratedDocument<SchoolInvite>;
type SchoolInviteModel = Model<SchoolInvite>;

const SchoolInvite =
  (mongoose.models.SchoolInvite as SchoolInviteModel | undefined) ||
  mongoose.model<SchoolInvite, SchoolInviteModel>(
    "SchoolInvite",
    SchoolInviteSchema,
  );

export default SchoolInvite;
