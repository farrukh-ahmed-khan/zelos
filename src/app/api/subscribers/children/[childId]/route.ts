import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { deleteChildSubscriberAccount } from "@/lib/subscribers/service";
import { serializeUser } from "@/lib/users/serialize-user";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    childId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const parent = await requireUser(request, ["subscriber"]);
    const { childId } = await context.params;

    const child = await deleteChildSubscriberAccount({
      parent,
      childId,
    });

    return successResponse({
      message: "Child subscriber account deleted successfully.",
      child: serializeUser(child),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
