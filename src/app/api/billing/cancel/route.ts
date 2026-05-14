import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { queueEmail } from "@/lib/notifications/service";
import { serializeSubscription } from "@/lib/subscriptions/serialize-subscription";
import { getLatestSubscriptionByUserId } from "@/lib/subscriptions/service";
import { cancelSubscriptionSchema } from "@/lib/validation/billing";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request, ["subscriber"]);
    cancelSubscriptionSchema.parse(await request.json().catch(() => ({})));
    const subscription = await getLatestSubscriptionByUserId(user._id.toString());

    if (!subscription || subscription.status !== "active") {
      throw new ApiError(404, "No active subscription was found.");
    }

    subscription.status = "canceled";
    subscription.canceledAt = new Date();
    subscription.renewalEligibleAt = subscription.expiryDate;
    await subscription.save();

    await queueEmail({
      template: "subscription-cancellation-confirmation",
      recipient: user.email,
      payload: {
        name: user.name,
        planType: subscription.planType,
        accessEndsAt: subscription.expiryDate,
      },
    });

    return successResponse({
      message: "Subscription canceled. Access remains active until the paid period ends.",
      subscription: serializeSubscription(subscription),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
