import { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/http";
import { requireUser } from "@/lib/auth/session";
import { createSubscriptionSchema } from "@/lib/validation/subscription";
import { createSubscriptionForUser } from "@/lib/subscriptions/service";
import { serializeSubscription } from "@/lib/subscriptions/serialize-subscription";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = createSubscriptionSchema.parse(await request.json());

    const subscription = await createSubscriptionForUser({
      user,
      planType: body.planType,
      status: body.status,
    });

    return successResponse(
      {
        message: "Subscription created successfully.",
        autoRenewal: false,
        subscription: serializeSubscription(subscription),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
