import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

// S3-compatible storage configuration
const s3Config: ConstructorParameters<typeof S3Client>[0] = {
  endpoint: process.env.S3_ENDPOINT ?? undefined,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // Required for S3-compatible services like MinIO
};

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.S3_BUCKET_NAME ?? "uploads";
const PUBLIC_URL = process.env.S3_PUBLIC_URL;

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/**
 * Generate a presigned URL for uploading a video to S3
 */
export async function getPresignedUploadUrl(
  userId: number,
  fileName: string,
  contentType: string,
  expiresIn = 3600, // 1 hour
  directory: "videos" | "video-thumbnails" = "videos",
): Promise<PresignedUploadResult> {
  const fileExtension = fileName.split(".").pop() ?? "mp4";
  const uniqueId = nanoid(12);
  const key = `${directory}/${uniqueId}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    // Note: ContentType is intentionally not set here to avoid signature mismatch issues
    // The client should set Content-Type header when uploading
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn,
    // Allow unsigned payload for browser uploads
    signableHeaders: new Set(["host"]),
  });

  const endpoint = s3Config?.endpoint as string | undefined;

  // Construct the public URL for accessing the file after upload
  let publicUrl: string;
  if (PUBLIC_URL) {
    publicUrl = `${PUBLIC_URL}/${key}`;
  } else if (endpoint) {
    publicUrl = `${endpoint}/${BUCKET_NAME}/${key}`;
  } else {
    const region = (s3Config?.region as string | undefined) ?? "us-east-1";
    // Default AWS S3 URL format
    publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

/**
 * Generate a presigned URL for downloading/viewing a video from S3
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a video from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export { s3Client, BUCKET_NAME };
