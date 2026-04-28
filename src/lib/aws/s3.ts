import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface S3UploadParams {
  file: Buffer;
  fileName: string;
  mimeType: string;
}

export interface S3UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3 and return the public URL
 */
export async function uploadToS3(params: S3UploadParams): Promise<S3UploadResult> {
  const { file, fileName, mimeType } = params;
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) {
    throw new Error("AWS_S3_BUCKET environment variable is not set");
  }

  // Generate a unique key with timestamp
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const key = `videos/${timestamp}-${randomStr}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: mimeType,
  });

  try {
    await s3Client.send(command);

    // Construct the S3 URL
    const url = `https://${bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete a file from S3 by key
 */
export async function deleteFromS3(key: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) {
    throw new Error("AWS_S3_BUCKET environment variable is not set");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
