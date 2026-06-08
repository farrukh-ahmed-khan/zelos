import { NextRequest } from "next/server";
import { parseFormData } from "@/lib/aws/parse-form";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import { createToolkitResourceSchema } from "@/lib/validation/commerce";
import { createToolkitResource, getToolkitResourcesForAdmin, serializeToolkitResource } from "@/lib/toolkit/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const resources = await getToolkitResourcesForAdmin();
    return successResponse({
      count: resources.length,
      resources: resources.map((resource) => serializeToolkitResource(resource)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { fields, files } = await parseFormData(request);
    const body = createToolkitResourceSchema.parse({
      title: fields.title,
      description: fields.description || undefined,
      resourceType: fields.resourceType,
      linkedVideoId: fields.linkedVideoId || undefined,
      ageTrack: fields.ageTrack,
      order: fields.order ? Number(fields.order) : undefined,
      answers: fields.answers
        ? fields.answers.split("\n").map((answer) => answer.trim()).filter(Boolean)
        : undefined,
      isActive: fields.isActive !== "false",
    });
    const file = files.resource;

    if (!file?.filename || file.buffer.length === 0) {
      throw new ApiError(400, "Choose a toolkit file to upload.");
    }

    if (file.mimetype.startsWith("video/")) {
      throw new ApiError(400, "Video files are not allowed on this page. Upload videos from Admin / Videos.");
    }

    const maxFileSize = 50 * 1024 * 1024;
    if (file.buffer.length > maxFileSize) {
      throw new ApiError(400, "File size exceeds maximum limit of 50MB.");
    }

    const resource = await createToolkitResource({
      ...body,
      file: file.buffer,
      fileName: file.filename,
      mimeType: file.mimetype,
    });
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
