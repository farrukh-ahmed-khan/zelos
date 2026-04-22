import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createChildSubscriberSchema } from "@/lib/validation/auth";
import {
  createChildSubscriberAccount,
  getChildSubscriberAccounts,
} from "@/lib/subscribers/service";
import { serializeUser } from "@/lib/users/serialize-user";
import { queueEmail } from "@/lib/notifications/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const parent = await requireUser(request, ["subscriber"]);
    const children = await getChildSubscriberAccounts(parent);

    return successResponse({
      children: children.map(serializeUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const parent = await requireUser(request, ["subscriber"]);
    const body = createChildSubscriberSchema.parse(await request.json());

    const result = await createChildSubscriberAccount({
      parent,
      name: body.name,
      age: body.age,
      ageTrack: body.ageTrack,
    });

    await queueEmail({
      template: "child-account-created",
      recipient: parent.email,
      payload: {
        parentName: parent.name,
        childName: result.child.name,
        credentials: result.credentials,
      },
    });

    return successResponse(
      {
        message: "Child subscriber account created successfully.",
        child: serializeUser(result.child),
        credentials: result.credentials,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
