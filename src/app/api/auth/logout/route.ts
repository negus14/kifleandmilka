import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  await destroySession();
  const url = new URL("/login?loggedOut=true", request.nextUrl.origin);
  return NextResponse.redirect(url);
}
