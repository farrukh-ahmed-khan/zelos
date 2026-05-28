import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse } from "@/lib/http";
import { getStaticPages, upsertStaticPage } from "@/lib/static-pages/service";
import { upsertStaticPageSchema } from "@/lib/validation/static-page";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const pages = await getStaticPages();
    return successResponse({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminPermission(request, "content.manage");
    const body = upsertStaticPageSchema.parse(await request.json());
    const page = await upsertStaticPage({
      ...body,
      updatedBy: admin._id.toString(),
    });

    return successResponse({
      message: "Static page saved successfully.",
      page,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
