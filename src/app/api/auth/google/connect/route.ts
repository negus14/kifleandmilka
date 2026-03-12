import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-auth";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || session.slug;

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/spreadsheets",
    "openid",
  ];

  // We pass the slug in state so the callback knows which site to update
  const url = getAuthUrl(scopes, slug);
  return NextResponse.redirect(url);
}
