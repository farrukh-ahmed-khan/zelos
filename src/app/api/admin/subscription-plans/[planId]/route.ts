import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { updateSubscriptionPlanSchema } from "@/lib/validation/admin";
import {
  serializeSubscriptionPlan,
  updateSubscriptionPlan,
} from "@/lib/subscription-plans/service";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    planId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdminPermission(request, "billing.read");
    const { planId } = await context.params;
    const body = updateSubscriptionPlanSchema.parse(await request.json());
    const plan = await updateSubscriptionPlan(planId, body);

    return successResponse({
      message: "Subscription plan updated successfully.",
      plan: serializeSubscriptionPlan(plan),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
