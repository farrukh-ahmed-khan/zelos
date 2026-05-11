import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import {
  getSubscriptionPlans,
  serializeSubscriptionPlan,
} from "@/lib/subscription-plans/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const includeInactive =
      request.nextUrl.searchParams.get("includeInactive") === "true";
    const plans = await getSubscriptionPlans(includeInactive);

    return successResponse({
      count: plans.length,
      plans: plans.map(serializeSubscriptionPlan),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
