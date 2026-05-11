import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import EmailOutbox from "@/models/EmailOutbox";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "users.manage-limited");
    await connectToDatabase();

    const emails = await EmailOutbox.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return successResponse({ emails });
  } catch (error) {
    return handleApiError(error);
  }
}
