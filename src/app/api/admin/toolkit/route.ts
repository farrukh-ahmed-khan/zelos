import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { createToolkitResourceSchema } from "@/lib/validation/commerce";
import { createToolkitResource, serializeToolkitResource } from "@/lib/toolkit/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const body = createToolkitResourceSchema.parse(await request.json());
    const resource = await createToolkitResource(body);
    return successResponse(
      {
        message: "Toolkit resource created successfully.",
        resource: serializeToolkitResource(resource),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
