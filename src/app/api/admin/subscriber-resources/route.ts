import { NextRequest } from "next/server";
import { parseFormData } from "@/lib/aws/parse-form";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import {
  createSubscriberResource,
  getSubscriberResourcesForAdmin,
  serializeSubscriberResource,
} from "@/lib/subscriber-resources/service";
import { createSubscriberResourceSchema } from "@/lib/validation/subscriber-resource";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const resources = await getSubscriberResourcesForAdmin();

    return successResponse({
      count: resources.length,
      resources: resources.map(serializeSubscriberResource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { fields, files } = await parseFormData(request);
    const body = createSubscriberResourceSchema.parse({
      title: fields.title,
      description: fields.description || undefined,
      resourceType: fields.resourceType,
      ageTrack: fields.ageTrack || "all",
      releaseDate: fields.releaseDate || undefined,
      order: fields.order ? Number(fields.order) : undefined,
      isActive: fields.isActive !== "false",
    });
    const file = files.resource;

    if (!file) {
      throw new ApiError(400, "Choose a resource file to upload.");
    }

    if (file.mimetype.startsWith("video/")) {
      throw new ApiError(400, "Video files are not allowed on this page. Upload videos from Admin / Videos.");
    }

    const maxFileSize = 50 * 1024 * 1024;
    if (file.buffer.length > maxFileSize) {
      throw new ApiError(400, "File size exceeds maximum limit of 50MB.");
    }

    const resource = await createSubscriberResource({
      ...body,
      file: file.buffer,
      fileName: file.filename,
      mimeType: file.mimetype,
    });

    return successResponse(
      {
        message: "Subscriber resource created successfully.",
        resource: serializeSubscriberResource(resource),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
