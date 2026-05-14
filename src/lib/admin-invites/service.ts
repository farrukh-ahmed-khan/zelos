import { randomBytes, createHash } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { hashPassword } from "@/lib/auth/password";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { queueEmail } from "@/lib/notifications/service";
import AdminInvite from "@/models/AdminInvite";
import User, { type UserDocument } from "@/models/User";

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildInviteUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return `${baseUrl}/admin/invites?token=${token}`;
}

export async function createAdminInvite(params: {
  actor: UserDocument;
  email: string;
  role: "forum-moderator" | "sub-admin";
  adminPermissions?: string[];
}) {
  if (params.actor.role !== "super-admin") {
    throw new ApiError(403, "Only a super admin can invite moderators and sub-admins.");
  }

  await connectToDatabase();

  const rawToken = randomBytes(32).toString("hex");
  const invite = await AdminInvite.create({
    email: params.email,
    role: params.role,
    token: hashInviteToken(rawToken),
    invitedBy: params.actor._id.toString(),
    adminPermissions: params.role === "sub-admin" ? params.adminPermissions ?? [] : [],
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  const inviteUrl = buildInviteUrl(rawToken);

  await queueEmail({
    template: params.role === "sub-admin" ? "sub-admin-invite" : "forum-moderator-invite",
    recipient: invite.email,
    payload: {
      inviteUrl,
      role: invite.role,
      expiresAt: invite.expiresAt,
    },
  });

  return { invite, inviteToken: rawToken, inviteUrl };
}

export async function acceptAdminInvite(params: {
  token: string;
  name: string;
  password: string;
  age: number;
}) {
  await connectToDatabase();

  const invite = await AdminInvite.findOne({
    token: hashInviteToken(params.token),
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).select("+token");

  if (!invite) {
    throw new ApiError(400, "Invite link is invalid, expired, or already used.");
  }

  const existingUser = await User.findOne({ email: invite.email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    name: params.name,
    email: invite.email,
    password: await hashPassword(params.password),
    role: invite.role,
    age: params.age,
    ageTrack: deriveAgeTrack(params.age),
    adminPermissions: invite.adminPermissions,
    emailVerifiedAt: new Date(),
    termsAcceptedAt: new Date(),
    termsVersion: "v1",
    status: "active",
  });

  invite.usedAt = new Date();
  await invite.save();

  await queueEmail({
    template: invite.role === "sub-admin" ? "welcome-sub-admin" : "welcome-forum-moderator",
    recipient: user.email,
    payload: {
      name: user.name,
      role: user.role,
    },
  });

  return user;
}
