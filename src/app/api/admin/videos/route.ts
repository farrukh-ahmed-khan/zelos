import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse, ApiError } from "@/lib/http";
import { createVideoSchema } from "@/lib/validation/admin";
import { createVideoByAdminWithUpload } from "@/lib/admin/service";
import { parseFormData } from "@/lib/aws/parse-form";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");

    // Parse multipart form data
    const { fields, files } = await parseFormData(request);

    // Validate fields
    const parsedFields = createVideoSchema.parse({
      title: fields.title,
      description: fields.description,
      ageTrack: fields.ageTrack,
      order: fields.order ? parseInt(fields.order, 10) : undefined,
    });

    // Get the video file
    const videoFile = files.video;
    if (!videoFile) {
      throw new ApiError(400, "No video file provided. Use 'video' field name.");
    }

    // Validate video file
    const validVideoMimeTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (!validVideoMimeTypes.includes(videoFile.mimetype)) {
      throw new ApiError(
        400,
        `Invalid video format. Allowed: ${validVideoMimeTypes.join(", ")}`
      );
    }

    // Limit file size (e.g., 500MB)
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    if (videoFile.buffer.length > MAX_FILE_SIZE) {
      throw new ApiError(400, "File size exceeds maximum limit of 500MB");
    }

    // Create video with S3 upload
    const video = await createVideoByAdminWithUpload({
      title: parsedFields.title,
      description: parsedFields.description,
      ageTrack: parsedFields.ageTrack,
      order: parsedFields.order,
      file: videoFile.buffer,
      fileName: videoFile.filename,
      mimeType: videoFile.mimetype,
    });

    return successResponse(
      {
        message: "Video uploaded successfully.",
        video: {
          id: video._id.toString(),
          title: video.title,
          description: video.description,
          url: video.url,
          ageTrack: video.ageTrack,
          order: video.order,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
