import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { serializeSubscription } from "@/lib/subscriptions/serialize-subscription";
import Subscription from "@/models/Subscription";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request, ["subscriber"]);
    const subscriptions = await Subscription.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(24);

    return successResponse({
      subscriptions: subscriptions.map(serializeSubscription),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
