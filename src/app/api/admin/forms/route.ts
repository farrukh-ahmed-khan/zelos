import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getFormSubmissions } from "@/lib/forms/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    const type = request.nextUrl.searchParams.get("type");
    const submissions = await getFormSubmissions(type);
    return successResponse({ count: submissions.length, submissions });
  } catch (error) {
    return handleApiError(error);
  }
}
