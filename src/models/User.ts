import mongoose, { HydratedDocument, InferSchemaType, Model, Schema } from "mongoose";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";
import { verifyPassword } from "@/lib/auth/password";

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
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
      immutable: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 72,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    ageTrack: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      default: function (this: { age: number }) {
        return deriveAgeTrack(this.age);
      },
    },
    parentId: {
      type: String,
      default: null,
      index: true,
      validate: {
        validator: function (
          this: { role: UserRole },
          value: string | null,
        ) {
          return this.role !== "child" || Boolean(value);
        },
        message: "Child accounts require a parentId.",
      },
    },
    schoolId: {
      type: String,
      default: null,
      index: true,
      validate: {
        validator: function (
          this: { role: UserRole },
          value: string | null,
        ) {
          return !["teacher", "student"].includes(this.role) || Boolean(value);
        },
        message: "Teacher and student accounts require a schoolId.",
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    mentorProfileId: {
      type: String,
      default: null,
      index: true,
    },
    forumPostingRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },
    adminPermissions: {
      type: [String],
      default: [],
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    isBanned: {
      type: Boolean,
      default: false,
      index: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return verifyPassword(candidatePassword, this.password);
};

type User = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<User, UserMethods>;
type UserModel = Model<User, object, UserMethods>;

const User =
  (mongoose.models.User as UserModel | undefined) ||
  mongoose.model<User, UserModel>("User", UserSchema);

export default User;
