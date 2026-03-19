import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Lazy-initialise so the module can be imported at build time without crashing.
// During `next build` on Railway, AUTH_SECRET may not be available — return null
// so the middleware gracefully redirects to login instead of crashing the build.
function getSecret() {
  if (!process.env.AUTH_SECRET) return null;
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

const PLATFORM_HOSTS = [
  "ithinkshewifey.com",
  "www.ithinkshewifey.com",
  "itsw.com",
  "www.itsw.com",
  "localhost",
  "127.0.0.1",
  "ithinkshewifey-dev.up.railway.app",
  "ithinkshewifey-prod.up.railway.app",
];

export default async function(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Subdomain & Custom Domain Routing ───
  const hostname = request.headers.get("host")?.split(":")[0] || "";
  const isMainHost = PLATFORM_HOSTS.some((h) => hostname === h);

  // Check for subdomain of ithinkshewifey.com or itsw.com (e.g. kifleandmilka.itsw.com)
  const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.(?:ithinkshewifey\.com|itsw\.com|localhost)$/);
  const subdomain = subdomainMatch?.[1];
  const isSubdomain = subdomain && subdomain !== "www" && subdomain !== "proxy";

  if (
    isSubdomain &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.includes(".")
  ) {
    // Rewrite subdomain to the site's slug path
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  const isPlatformHost = isMainHost || (!!subdomain && (subdomain === "www" || subdomain === "proxy"));

  if (
    !isPlatformHost &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/_domain/") &&
    !pathname.includes(".")
  ) {
    // Validate hostname format — reject obviously invalid or malicious values.
    // Valid domains: letters, numbers, hyphens, dots. Max 253 chars (DNS limit).
    if (!hostname || hostname.length > 253 || !/^[a-z0-9.-]+$/.test(hostname)) {
      return new NextResponse("Invalid host", { status: 400 });
    }

    const url = request.nextUrl.clone();
    url.pathname = `/_domain/${hostname}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ─── Dashboard Auth ───
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("itsw_session")?.value;
    const secret = getSecret();
    if (!token || !secret) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
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
