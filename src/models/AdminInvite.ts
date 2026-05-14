import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";

const AdminInviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["forum-moderator", "sub-admin"],
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    invitedBy: {
      type: String,
      required: true,
      index: true,
    },
    adminPermissions: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
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

type AdminInvite = InferSchemaType<typeof AdminInviteSchema>;
export type AdminInviteDocument = HydratedDocument<AdminInvite>;
type AdminInviteModel = Model<AdminInvite>;

const AdminInvite =
  (mongoose.models.AdminInvite as AdminInviteModel | undefined) ||
  mongoose.model<AdminInvite, AdminInviteModel>("AdminInvite", AdminInviteSchema);

export default AdminInvite;
