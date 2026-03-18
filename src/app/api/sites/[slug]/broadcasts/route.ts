import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getBroadcastsBySite, createBroadcast } from "@/lib/data/broadcasts";
import { broadcastSchema, parseBody } from "@/lib/validations";
import { apiError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const items = await getBroadcastsBySite(slug);
    return NextResponse.json({ broadcasts: items });
  } catch (error) {
    console.error("[API] GET Broadcasts Error:", error);
    return apiError("Failed to load broadcasts");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await requireAuth(slug);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const parsed = parseBody(broadcastSchema, body);
    if (typeof parsed === "string") {
      return apiError(parsed, 400);
    }

    const { groupId, subject, body: msgBody, channel } = parsed;

    // Subject is required for email broadcasts (SMS doesn't need one)
    if (channel !== "sms" && !subject) {
      return apiError("Subject is required for email broadcasts", 400);
    }

    const broadcast = await createBroadcast(slug, {
      groupId,
      subject: subject || "",
      body: msgBody,
      channel: channel || "email",
    });

    return NextResponse.json({ broadcast });
  } catch (error) {
    console.error("[API] POST Broadcast Error:", error);
    return apiError("Failed to create broadcast");
  }
}
