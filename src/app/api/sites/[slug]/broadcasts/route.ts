import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBroadcastsBySite, createBroadcast } from "@/lib/data/broadcasts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await getBroadcastsBySite(slug);
    return NextResponse.json({ broadcasts: items });
  } catch (error) {
    console.error("[API] GET Broadcasts Error:", error);
    return NextResponse.json({ error: "Failed to load broadcasts" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session || session.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, subject, body: msgBody, channel } = body;

    if (!groupId || !msgBody) {
      return NextResponse.json({ error: "Group and message body are required" }, { status: 400 });
    }

    if (channel && channel !== "email" && channel !== "sms") {
      return NextResponse.json({ error: "Channel must be 'email' or 'sms'" }, { status: 400 });
    }

    if (channel !== "sms" && !subject) {
      return NextResponse.json({ error: "Subject is required for email broadcasts" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
  }
}
