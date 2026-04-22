import { type UserDocument } from "@/models/User";

export function serializeUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    age: user.age,
    ageTrack: user.ageTrack,
    parentId: user.parentId ?? null,
    schoolId: user.schoolId ?? null,
    interests: user.interests ?? [],
    mentorProfileId: user.mentorProfileId ?? null,
    forumPostingRevoked: user.forumPostingRevoked ?? false,
    status: user.status ?? (user.isBanned ? "banned" : "active"),
    adminPermissions: user.adminPermissions ?? [],
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
