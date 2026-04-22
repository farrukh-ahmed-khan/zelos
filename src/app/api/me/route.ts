import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    return successResponse({
      user: serializeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
