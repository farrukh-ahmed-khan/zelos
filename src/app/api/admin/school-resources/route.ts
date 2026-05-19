import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";
import {
  createSchoolResource,
  getSchoolResourcesForAdmin,
  serializeSchoolResource,
} from "@/lib/school-resources/service";
import { createSchoolResourceSchema } from "@/lib/validation/school-resource";
import { parseFormData } from "@/lib/aws/parse-form";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const resources = await getSchoolResourcesForAdmin();

    return successResponse({
      count: resources.length,
      resources: resources.map(serializeSchoolResource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const { fields, files } = await parseFormData(request);
    const body = createSchoolResourceSchema.parse({
      title: fields.title,
      description: fields.description || undefined,
      resourceType: fields.resourceType,
      audience: fields.audience,
      ageTrack: fields.ageTrack,
      schoolScope: fields.schoolScope,
      schoolIds: fields.schoolIds
        ? fields.schoolIds.split(",").map((id) => id.trim()).filter(Boolean)
        : undefined,
      district: fields.district || undefined,
      releaseDate: fields.releaseDate || undefined,
      order: fields.order ? Number(fields.order) : undefined,
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

    const resource = await createSchoolResource({
      ...body,
      file: file.buffer,
      fileName: file.filename,
      mimeType: file.mimetype,
    });

    return successResponse(
      {
        message: "School resource created successfully.",
        resource: serializeSchoolResource(resource),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
