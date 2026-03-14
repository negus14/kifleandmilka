import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSession } from "../../../lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../../lib/r2";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const originalPrefix = `sites/${session.slug}/`;
  const lowerPrefix = `sites/${session.slug.toLowerCase()}/`;

  const missingVars = [];
  if (!R2_BUCKET) missingVars.push("R2_BUCKET");
  if (!process.env.R2_ACCOUNT_ID) missingVars.push("R2_ACCOUNT_ID");
  if (!process.env.R2_ACCESS_KEY_ID) missingVars.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY) missingVars.push("R2_SECRET_ACCESS_KEY");
  if (!R2_PUBLIC_URL) missingVars.push("R2_PUBLIC_URL");

  const client = r2;

  if (missingVars.length > 0 || !client) {
    console.error("R2 is not configured for media. Missing environment variables or client failed to initialize:", missingVars.join(", "));
    return NextResponse.json({ 
      images: [], 
      error: `Media library not configured. Missing or invalid credentials.`,
      debug_config: {
        has_client: !!client,
        has_bucket: !!R2_BUCKET,
        has_account: !!process.env.R2_ACCOUNT_ID,
        has_key: !!process.env.R2_ACCESS_KEY_ID,
        has_secret: !!process.env.R2_SECRET_ACCESS_KEY,
        has_public_url: !!R2_PUBLIC_URL
      },
      missing: missingVars
    }, { status: 500 });
  }

  try {
    const fetchObjects = async (p: string) => {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET as string,
        Prefix: p,
      });
      const response = await client.send(command);
      return response.Contents || [];
    };

    // Fetch from both prefixes in parallel
    const [originalResults, lowerResults] = await Promise.all([
      fetchObjects(originalPrefix),
      originalPrefix !== lowerPrefix ? fetchObjects(lowerPrefix) : Promise.resolve([])
    ]);

    // Combine and deduplicate by Key
    const allObjects = [...originalResults, ...lowerResults];
    const uniqueObjects = Array.from(new Map(allObjects.map(obj => [obj.Key, obj])).values());
    
    // Map objects to full public URLs and include key for selection
    const images = uniqueObjects
      .filter(obj => obj.Key && !obj.Key.endsWith('/')) // Filter out folders
      .map(obj => ({
        url: `${R2_PUBLIC_URL}/${obj.Key}`,
        key: obj.Key,
        lastModified: obj.LastModified,
        size: obj.Size
      }))
      .sort((a, b) => {
        const timeA = a.lastModified instanceof Date ? a.lastModified.getTime() : 0;
        const timeB = b.lastModified instanceof Date ? b.lastModified.getTime() : 0;
        return timeB - timeA;
      });

    return NextResponse.json({ images, debug_prefixes: [originalPrefix, lowerPrefix] });
  } catch (err: any) {
    console.error("Media List Error:", err);
    return NextResponse.json({ error: "Failed to load media library" }, { status: 500 });
  }
}
