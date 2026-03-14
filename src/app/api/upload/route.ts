import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "../../../lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../../lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, contentType, fileSize } = await request.json();

  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (fileSize && fileSize > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const missingVars = [];
  if (!R2_BUCKET) missingVars.push("R2_BUCKET");
  if (!process.env.R2_ACCOUNT_ID) missingVars.push("R2_ACCOUNT_ID");
  if (!process.env.R2_ACCESS_KEY_ID) missingVars.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY) missingVars.push("R2_SECRET_ACCESS_KEY");
  if (!R2_PUBLIC_URL) missingVars.push("R2_PUBLIC_URL");

  console.log("[Upload API] Config Check:", {
    has_bucket: !!R2_BUCKET,
    has_account: !!process.env.R2_ACCOUNT_ID,
    has_key: !!process.env.R2_ACCESS_KEY_ID,
    has_secret: !!process.env.R2_SECRET_ACCESS_KEY,
    has_public_url: !!R2_PUBLIC_URL,
    missing: missingVars
  });

  const client = r2;

  if (missingVars.length > 0 || !client) {
    console.error("R2 is not configured for upload. Missing environment variables or client failed to initialize:", missingVars.join(", "));
    return NextResponse.json({ 
      error: `Upload not configured. Missing or invalid credentials.`,
      missing: missingVars
    }, { status: 500 });
  }

  // Key: sites/{slug}/{timestamp}-{filename}
  const ext = fileName.split(".").pop() || "jpg";
  const key = `sites/${session.slug}/${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET as string,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
