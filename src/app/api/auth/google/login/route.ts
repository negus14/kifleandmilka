import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-auth";

export async function GET() {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];

  const url = getAuthUrl(scopes);
  return NextResponse.redirect(url);
}
