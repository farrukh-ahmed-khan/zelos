import { NextRequest } from "next/server";
import { requireAdminPermission } from "@/lib/auth/session";
import { handleApiError, successResponse, ApiError } from "@/lib/http";
import { createVideoSchema } from "@/lib/validation/admin";
import { createVideoByAdminWithUpload } from "@/lib/admin/service";
import { parseFormData } from "@/lib/aws/parse-form";
import Video from "@/models/Video";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "content.manage");
    const videos = await Video.find()
      .sort({ audience: 1, ageTrack: 1, order: 1, createdAt: -1 })
      .lean();

    return successResponse({
      count: videos.length,
      videos: videos.map((video) => ({
        id: video._id.toString(),
        title: video.title,
        description: video.description,
        url: video.url,
        ageTrack: video.ageTrack,
        audience: video.audience,
        category: video.category,
        playlist: video.playlist,
        order: video.order,
        releaseDate: video.releaseDate,
        dripEnabled: video.dripEnabled,
        isFreePreview: video.isFreePreview,
        isMissionVideo: video.isMissionVideo,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

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
      audience: fields.audience,
      category: fields.category,
      playlist: fields.playlist,
      order: fields.order ? parseInt(fields.order, 10) : undefined,
      releaseDate: fields.releaseDate || undefined,
      dripEnabled: fields.dripEnabled ? fields.dripEnabled === "true" : undefined,
      isFreePreview: fields.isFreePreview ? fields.isFreePreview === "true" : undefined,
      isMissionVideo: fields.isMissionVideo ? fields.isMissionVideo === "true" : undefined,
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
      audience: parsedFields.audience,
      category: parsedFields.category,
      playlist: parsedFields.playlist,
      order: parsedFields.order,
      releaseDate: parsedFields.releaseDate
        ? new Date(parsedFields.releaseDate)
        : null,
      dripEnabled: parsedFields.dripEnabled,
      isFreePreview: parsedFields.isFreePreview,
      isMissionVideo: parsedFields.isMissionVideo,
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
          audience: video.audience,
          category: video.category,
          playlist: video.playlist,
          order: video.order,
          releaseDate: video.releaseDate,
          dripEnabled: video.dripEnabled,
          isFreePreview: video.isFreePreview,
          isMissionVideo: video.isMissionVideo,
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
