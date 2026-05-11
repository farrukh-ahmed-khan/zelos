import { handleApiError, successResponse } from "@/lib/http";
import { getActiveScholarships, serializeScholarship } from "@/lib/scholarships/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const scholarships = await getActiveScholarships();
    return successResponse({
      count: scholarships.length,
      scholarships: scholarships.map(serializeScholarship),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
