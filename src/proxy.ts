import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production"
);

export default async function(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("itsw_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const sessionSlug = payload.slug as string;

      // Extract the slug from /dashboard/{slug}/...
      const pathParts = pathname.split("/");
      const requestedSlug = pathParts[2]; // ["", "dashboard", "{slug}", ...]

      // If accessing a specific dashboard, verify ownership
      if (requestedSlug && sessionSlug !== requestedSlug) {
        return NextResponse.redirect(new URL(`/dashboard/${sessionSlug}`, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
