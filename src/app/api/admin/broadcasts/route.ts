import { NextRequest } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createBroadcastSchema } from "@/lib/validation/admin";
import { createBroadcastMessage } from "@/lib/admin/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireUser(request, ADMIN_ROLES);
    const body = createBroadcastSchema.parse(await request.json());

    const broadcast = await createBroadcastMessage({
      title: body.title,
      content: body.content,
      sentBy: admin._id.toString(),
    });

    return successResponse(
      {
        message: "Broadcast message sent successfully.",
        broadcast: {
          id: broadcast._id.toString(),
          title: broadcast.title,
          content: broadcast.content,
          sentBy: broadcast.sentBy,
          createdAt: broadcast.createdAt,
          updatedAt: broadcast.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
