import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  await destroySession();
  const host = request.headers.get("host") || request.nextUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const url = new URL("/login?loggedOut=true", `${protocol}://${host}`);
  return NextResponse.redirect(url);
}
