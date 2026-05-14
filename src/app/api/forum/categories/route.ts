import { handleApiError, successResponse } from "@/lib/http";
import { getForumCategorySummary } from "@/lib/forum/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getForumCategorySummary();
    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
