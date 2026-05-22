import { NextRequest } from "next/server";
import { parseFormData } from "@/lib/aws/parse-form";
import { uploadToS3 } from "@/lib/aws/s3";
import { requireAdminPermission } from "@/lib/auth/session";
import { ApiError, handleApiError, successResponse } from "@/lib/http";

export const runtime = "nodejs";

const VALID_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "events.manage");
    const { files } = await parseFormData(request);
    const image = files.image;

    if (!image) {
      throw new ApiError(400, "Choose an image to upload.");
    }

    if (!VALID_IMAGE_MIME_TYPES.includes(image.mimetype)) {
      throw new ApiError(400, "Invalid image format. Use JPG, PNG, WebP, or GIF.");
    }

    if (image.buffer.length > MAX_IMAGE_SIZE) {
      throw new ApiError(400, "Image size exceeds the 10MB limit.");
    }

    const upload = await uploadToS3({
      file: image.buffer,
      fileName: image.filename,
      keyPrefix: "events",
      mimeType: image.mimetype,
    });

    return successResponse(
      {
        image: {
          url: upload.url,
          s3Key: upload.key,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
