import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/http";
import { createBroadcastSchema } from "@/lib/validation/admin";
import { createBroadcastMessage } from "@/lib/admin/service";
import BroadcastMessage from "@/models/BroadcastMessage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    await connectToDatabase();
    const broadcasts = await BroadcastMessage.find().sort({ createdAt: -1 }).limit(100).lean();
    return successResponse({
      broadcasts: broadcasts.map((b) => ({
        id: b._id.toString(),
        title: b.title,
        content: b.content,
        sentBy: b.sentBy,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "content.manage");
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
