import { createHash, randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/db";
import { ApiError } from "@/lib/http";
import { ADMIN_ROLES, hasRequiredRole } from "@/lib/auth/roles";
import { hashPassword } from "@/lib/auth/password";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { type UserDocument } from "@/models/User";
import User from "@/models/User";
import School from "@/models/School";
import SchoolInvite from "@/models/SchoolInvite";
import SchoolAssignedVideo from "@/models/SchoolAssignedVideo";
import Video from "@/models/Video";

const SCHOOL_INVITE_EXPIRY_HOURS = 48;

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildInviteUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return `${baseUrl}/accept-school-invite?token=${token}`;
}

async function getPendingInviteCount(params: {
  schoolId: string;
  role: "teacher" | "student";
}) {
  return SchoolInvite.countDocuments({
    schoolId: params.schoolId,
    role: params.role,
    used: false,
    expiresAt: { $gt: new Date() },
  });
}

async function syncSchoolSeatCounts(schoolId: string) {
  const [teachersCount, studentsCount] = await Promise.all([
    User.countDocuments({ schoolId, role: "teacher" }),
    User.countDocuments({ schoolId, role: "student" }),
  ]);

  await School.findByIdAndUpdate(schoolId, {
    $set: {
      teachersCount,
      studentsCount,
    },
  });

  return { teachersCount, studentsCount };
}

async function ensureSchoolCapacity(params: {
  schoolId: string;
  role: "teacher" | "student";
  includePendingInvite?: boolean;
}) {
  const school = await School.findById(params.schoolId);

  if (!school) {
    throw new ApiError(404, "School not found.");
  }

  const { teachersCount, studentsCount } = await syncSchoolSeatCounts(
    params.schoolId,
  );

  const pendingInvites = params.includePendingInvite
    ? await getPendingInviteCount({
        schoolId: params.schoolId,
        role: params.role,
      })
    : 0;

  if (
    params.role === "teacher" &&
    teachersCount + pendingInvites >= school.teacherLimit
  ) {
    throw new ApiError(409, "Teacher limit exceeded for this school.");
  }

  if (
    params.role === "student" &&
    studentsCount + pendingInvites >= school.studentLimit
  ) {
    throw new ApiError(409, "Student limit exceeded for this school.");
  }

  return school;
}

export async function createSchool(params: {
  name: string;
  teacherLimit: number;
  studentLimit: number;
  assignedVideoIds?: string[];
}) {
  await connectToDatabase();

  const existing = await School.findOne({ name: params.name });

  if (existing) {
    throw new ApiError(409, "A school with this name already exists.");
  }

  const school = await School.create({
    name: params.name,
    teacherLimit: params.teacherLimit,
    studentLimit: params.studentLimit,
    teachersCount: 0,
    studentsCount: 0,
  });

  if (params.assignedVideoIds?.length) {
    const videos = await Video.find({ _id: { $in: params.assignedVideoIds } }).select("_id");

    if (videos.length !== params.assignedVideoIds.length) {
      throw new ApiError(422, "One or more assigned videos do not exist.");
    }

    await SchoolAssignedVideo.insertMany(
      params.assignedVideoIds.map((videoId) => ({
        schoolId: school._id.toString(),
        videoId,
      })),
      { ordered: false },
    );
  }

  return school;
}

async function createInviteRecord(params: {
  inviter: UserDocument;
  schoolId: string;
  role: "teacher" | "student";
  email: string;
}) {
  await connectToDatabase();

  const school = await ensureSchoolCapacity({
    schoolId: params.schoolId,
    role: params.role,
    includePendingInvite: true,
  });

  const existingUser = await User.findOne({ email: params.email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const pendingInvite = await SchoolInvite.findOne({
    schoolId: params.schoolId,
    email: params.email,
    role: params.role,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (pendingInvite) {
    throw new ApiError(409, "An active invite already exists for this email.");
  }

  const rawToken = randomBytes(32).toString("hex");
  const invite = await SchoolInvite.create({
    schoolId: params.schoolId,
    role: params.role,
    email: params.email,
    token: hashInviteToken(rawToken),
    invitedBy: params.inviter._id.toString(),
    expiresAt: new Date(Date.now() + SCHOOL_INVITE_EXPIRY_HOURS * 60 * 60 * 1000),
    used: false,
  });

  return {
    invite,
    school,
    rawToken,
    inviteUrl: buildInviteUrl(rawToken),
  };
}

export async function inviteTeacherToSchool(params: {
  inviter: UserDocument;
  schoolId: string;
  email: string;
}) {
  if (!hasRequiredRole(params.inviter.role, ADMIN_ROLES)) {
    throw new ApiError(403, "Only admins can invite teachers.");
  }

  return createInviteRecord({
    inviter: params.inviter,
    schoolId: params.schoolId,
    role: "teacher",
    email: params.email,
  });
}

export async function inviteStudentToSchool(params: {
  inviter: UserDocument;
  email: string;
}) {
  if (params.inviter.role !== "teacher") {
    throw new ApiError(403, "Only teachers can invite students.");
  }

  if (!params.inviter.schoolId) {
    throw new ApiError(403, "Teacher must belong to a school to invite students.");
  }

  return createInviteRecord({
    inviter: params.inviter,
    schoolId: params.inviter.schoolId,
    role: "student",
    email: params.email,
  });
}

export async function acceptSchoolInvite(params: {
  token: string;
  name: string;
  password: string;
  age: number;
  ageTrack?: string;
}) {
  await connectToDatabase();

  const invite = await SchoolInvite.findOne({
    token: hashInviteToken(params.token),
    used: false,
    expiresAt: { $gt: new Date() },
  }).select("+token");

  if (!invite) {
    throw new ApiError(400, "School invite is invalid or expired.");
  }

  const school = await ensureSchoolCapacity({
    schoolId: invite.schoolId,
    role: invite.role,
    includePendingInvite: false,
  });

  const existingUser = await User.findOne({ email: invite.email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const countField = invite.role === "teacher" ? "teachersCount" : "studentsCount";
  const limitValue =
    invite.role === "teacher" ? school.teacherLimit : school.studentLimit;

  const updatedSchool = await School.findOneAndUpdate(
    {
      _id: invite.schoolId,
      [countField]: {
        $lt: limitValue,
      },
    },
    {
      $inc: {
        [countField]: 1,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedSchool) {
    throw new ApiError(409, "No seats are available for this invite anymore.");
  }

  try {
    const user = await User.create({
      name: params.name,
      email: invite.email,
      password: await hashPassword(params.password),
      role: invite.role,
      age: params.age,
      ageTrack: params.ageTrack ?? deriveAgeTrack(params.age),
      schoolId: invite.schoolId,
    });

    invite.used = true;
    invite.usedAt = new Date();
    await invite.save();

    return user;
  } catch (error) {
    await School.findByIdAndUpdate(invite.schoolId, {
      $inc: {
        [countField]: -1,
      },
    });

    throw error;
  }
}

export async function getAssignedSchoolVideoIds(schoolId: string) {
  await connectToDatabase();

  const assignments = await SchoolAssignedVideo.find({ schoolId }).select("videoId");
  return new Set(assignments.map((assignment) => assignment.videoId));
}
