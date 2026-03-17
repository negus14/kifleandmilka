import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production"
);

const PLATFORM_HOSTS = [
  "ithinkshewifey.com",
  "www.ithinkshewifey.com",
  "localhost",
  "127.0.0.1",
];

export default async function(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Custom Domain Routing ───
  const hostname = request.headers.get("host")?.split(":")[0] || "";
  const isPlatformHost = PLATFORM_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));

  if (
    !isPlatformHost &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/_domain/") &&
    !pathname.includes(".")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/_domain/${hostname}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─── Dashboard Auth ───
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
  matcher: [
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
