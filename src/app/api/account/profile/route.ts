import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateProfileSchema } from "@/lib/validation/auth";
import { deriveAgeTrack } from "@/lib/users/age-track";
import { serializeUser } from "@/lib/users/serialize-user";
import VideoProgress from "@/models/VideoProgress";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = updateProfileSchema.parse(await request.json());

    if (body.name !== undefined) {
      user.name = body.name;
    }

    const previousAgeTrack = user.ageTrack;

    if (body.age !== undefined) {
      user.age = body.age;
      user.ageTrack = body.ageTrack ?? deriveAgeTrack(body.age);
    } else if (body.ageTrack !== undefined) {
      user.ageTrack = body.ageTrack;
    }

    if (body.interests !== undefined) {
      user.interests = body.interests;
    }

    if (previousAgeTrack !== user.ageTrack) {
      await VideoProgress.deleteMany({ userId: user._id.toString() });
    }

    await user.save();

    return successResponse({
      message: "Profile updated successfully.",
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
