import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["subscriber"]);
    user.paidIntroVideoSeenAt = user.paidIntroVideoSeenAt ?? new Date();
    await user.save();

    return successResponse({
      message: "Intro video marked as seen.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
