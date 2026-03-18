import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSession } from "../../../lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "../../../lib/r2";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiError("Unauthorized", 401);
  }

  const originalPrefix = `sites/${session.slug}/`;
  const lowerPrefix = `sites/${session.slug.toLowerCase()}/`;

  if (!r2 || !R2_BUCKET || !R2_PUBLIC_URL) {
    return apiError("Media library not configured", 503);
  }

  try {
    const fetchObjects = async (p: string) => {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET as string,
        Prefix: p,
      });
      const response = await r2!.send(command);
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

    return NextResponse.json({ images });
  } catch (err: any) {
    console.error("Media List Error:", err);
    return apiError("Failed to load media library");
  }
}
