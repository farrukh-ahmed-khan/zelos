import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createSubscriptionPlanSchema } from "@/lib/validation/admin";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  serializeSubscriptionPlan,
} from "@/lib/subscription-plans/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
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

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "billing.read");
    const body = createSubscriptionPlanSchema.parse(await request.json());
    const plan = await createSubscriptionPlan(body);

    return successResponse(
      {
        message: "Subscription plan created successfully.",
        plan: serializeSubscriptionPlan(plan),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
