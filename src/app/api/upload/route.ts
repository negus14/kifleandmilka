import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "../../../lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../../lib/r2";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  // Rate limit: 30 uploads per minute per user (gallery uploads can be bursty)
  const { allowed } = await rateLimit(session.slug, { prefix: "rl:upload", maxRequests: 30, windowSeconds: 60 });
  if (!allowed) {
    return apiError("Upload rate limit exceeded. Please wait.", 429);
  }

  const { fileName, contentType, fileSize } = await request.json();

  if (!fileName || !contentType) {
    return apiError("fileName and contentType required", 400);
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return apiError("File type not allowed", 400);
  }

  if (fileSize && fileSize > MAX_SIZE) {
    return apiError("File too large (max 10MB)", 400);
  }

  if (!r2 || !R2_BUCKET || !R2_PUBLIC_URL) {
    return apiError("Upload not configured", 503);
  }

  // Key: sites/{slug}/{timestamp}-{filename}
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return apiError("Invalid file extension", 400);
  }
  const key = `sites/${session.slug}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET as string,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2!, command, { expiresIn: 600 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
