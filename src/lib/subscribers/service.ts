import { randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { hashPassword } from "@/lib/auth/password";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { type UserDocument } from "@/models/User";
import User from "@/models/User";
import VideoProgress from "@/models/VideoProgress";

function buildChildLoginEmail(parentEmail: string) {
  const localPart = parentEmail.split("@")[0] ?? "parent";
  const suffix = randomBytes(4).toString("hex");
  return `${localPart}.child.${suffix}@child.zelos.local`;
}

function generatePassword() {
  const suffix = randomBytes(4).toString("hex");
  return `Zelos${suffix}9A`;
}

export async function createChildSubscriberAccount(params: {
  parent: UserDocument;
  name: string;
  age: number;
  ageTrack?: string;
}) {
  if (params.parent.role !== "subscriber") {
    throw new ApiError(403, "Only subscriber accounts can create child accounts.");
  }

  await connectToDatabase();

  const loginEmail = buildChildLoginEmail(params.parent.email);
  const plainPassword = generatePassword();

  const child = await User.create({
    name: params.name,
    email: loginEmail,
    password: await hashPassword(plainPassword),
    role: "child",
    age: params.age,
    ageTrack: params.ageTrack ?? deriveAgeTrack(params.age),
    parentId: params.parent._id.toString(),
    status: "active",
  });

  return {
    child,
    credentials: {
      email: loginEmail,
      password: plainPassword,
    },
  };
}

export async function getChildSubscriberAccounts(parent: UserDocument) {
  if (parent.role !== "subscriber") {
    throw new ApiError(403, "Only subscriber accounts can view child accounts.");
  }

  await connectToDatabase();

  return User.find({
    parentId: parent._id.toString(),
    role: "child",
  }).sort({ createdAt: -1 });
}

export async function deleteChildSubscriberAccount(params: {
  parent: UserDocument;
  childId: string;
}) {
  if (params.parent.role !== "subscriber") {
    throw new ApiError(403, "Only subscriber accounts can delete child accounts.");
  }

  await connectToDatabase();

  const child = await User.findOne({
    _id: params.childId,
    parentId: params.parent._id.toString(),
    role: "child",
  });

  if (!child) {
    throw new ApiError(404, "Child account not found.");
  }

  await Promise.all([
    User.deleteOne({ _id: child._id }),
    VideoProgress.deleteMany({ userId: child._id.toString() }),
  ]);

  return child;
}
